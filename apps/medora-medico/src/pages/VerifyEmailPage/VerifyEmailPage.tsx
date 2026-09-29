import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api/services/api";
import { Endpoints } from "../../api/enums/endpoints";
import { MfaAction } from "../../api/enums/mfaAction"; 
import { VerifyEmailScreen } from "@medora_web/shared";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const userId = location.state?.userId ?? "";

  const handleInitVerification = async () => {
  await api.post(Endpoints.RESEND_EMAIL_VERIFICATION, null, {
    params: { ids: userId },
  });
};

  const handleVerify = async (code: string) => {
    const response = await api.post(Endpoints.VERIFY_EMAIL, {
      code,
      userId,
      action: MfaAction.EMAIL_VERIFICATION,
    });
    return response.data;
  };

  const handleComplete = (accessToken: string) => {
    signIn(accessToken);
    navigate("/medico/");
  };

  return (
    <VerifyEmailScreen
      onInitVerification={handleInitVerification}
      onVerify={handleVerify}
      onComplete={handleComplete}
    />
  );
}