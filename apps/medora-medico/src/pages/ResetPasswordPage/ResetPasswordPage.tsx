import { ResetPassword } from "@medora_web/shared";
import { api } from "../../api/services/api";
import { Endpoints } from "../../api/enums/endpoints";

export default function ResetPasswordPage() {

  const handleSubmit = async (email: string, code: string, newPwd: string) => {
    await api.post(Endpoints.RESET_PWD, {Email: email, ResetCode: code, NewPassword: newPwd})
  }

  return <>
    <ResetPassword handleSubmit={handleSubmit} />
  </>
}