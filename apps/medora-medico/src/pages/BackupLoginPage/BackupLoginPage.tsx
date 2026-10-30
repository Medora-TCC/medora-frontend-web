import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api/services/api";
import { Endpoints } from "../../api/enums/endpoints";
import { BackupLogin } from "@medora_web/shared";


export default function BackupLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleVerify = async (code: string) => {
    // o backend devolve "acessToken" (com um "c" só)
    const response = await api.post<{ acessToken: string }>(Endpoints.USE_BACKUP_CODE, { backupCode: code });
    return { accessToken: response.data.acessToken };
  }


  const handleComplete = (accessToken: string) => {
    signIn(accessToken);
    navigate("/medico/");
  }

  return (
    <BackupLogin
      handleVerify={handleVerify}
      handleComplete={handleComplete} />
  )

}