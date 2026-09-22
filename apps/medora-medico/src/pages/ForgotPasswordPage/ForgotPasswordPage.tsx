import { ForgotPassword } from "@medora_web/shared";
import { api } from "../../api/services/api";
import { Endpoints } from "../../api/enums/endpoints";

export default function ForgotPasswordPage() {

  const handleSend = async (email: string) => {
      await api.post(Endpoints.FORGOT_PWD, {email: email})
  }

  return <>
    <ForgotPassword
      handleSend={handleSend} />
  </>;
}