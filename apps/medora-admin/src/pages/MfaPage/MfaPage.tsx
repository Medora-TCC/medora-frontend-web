import { useNavigate } from "react-router";
import { VerifyMfaScreen } from "@medora_web/shared";
import { initMfa, verifyMfa } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";

export default function MfaPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleComplete = (accessToken: string) => {
    signIn(accessToken);
    navigate("/admin");
  };

  return (
    <VerifyMfaScreen
      onInitMfa={initMfa}
      onVerify={verifyMfa}
      onComplete={handleComplete}
      backupLoginHref="/"
    />
  );
}
