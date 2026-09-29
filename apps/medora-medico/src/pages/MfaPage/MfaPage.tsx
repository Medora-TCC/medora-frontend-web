import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api/services/api";
import { Endpoints } from "../../api/enums/endpoints";
import { VerifyMfaScreen } from "@medora_web/shared";
import { MfaAction } from "../../api/enums/mfaAction";

export default function MfaPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleInitMfa = async () => {
    const response = await api.post(Endpoints.INIT_MFA, { Action: MfaAction.LOGIN });

    if (response.status !== 200) {
      navigate("/login/")
    }

    return response.data;
  }

  const handleVerify = async (code: string, rememberDevice: boolean) => {
    const response = await api.post(Endpoints.VERIFY_AUTH_CODE, { code, rememberDevice });

    return response.data;
  };

  const handleComplete = (accessToken: string) => {
    signIn(accessToken);
    navigate("/medico/");
  };

  return (
    <VerifyMfaScreen
      onInitMfa={handleInitMfa} 
      onVerify={handleVerify} 
      onComplete={handleComplete} 
      backupLoginHref="/backup-code"
    />
  );
}