import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/services/api";
import { useNavigate } from "react-router";
import { Endpoints } from "../api/enums/endpoints";

interface AuthContextType {
  accessToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    async function loadStorageData() {
      isRefreshing = true;
      try {
        const response = await api.post(Endpoints.REFRESH, {});
        const { accessToken: newAccessToken } = response.data;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);
      } catch (error) {
        setAccessToken(null);
        processQueue(error, null);
      } finally {
        isRefreshing = false;
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (tokenRef.current) {
          config.headers.Authorization = `Bearer ${tokenRef.current}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = api.interceptors.response.use(
      (response) => response,

      async (error) => {
        const originalRequest = error.config;
        console.log(originalRequest.url);
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== Endpoints.REFRESH &&
          originalRequest.url !== Endpoints.LOGIN
        ) {
          if (isRefreshing) {
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const response = await api.post(Endpoints.REFRESH);
            const { accessToken: newAccessToken } = response.data;

            setAccessToken(newAccessToken);

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            setAccessToken(null);

            navigate("/login");
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, []);

  const signIn = (token: string) => {
    setAccessToken(token);
    tokenRef.current = token;
  };

  const signOut = () => {
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
