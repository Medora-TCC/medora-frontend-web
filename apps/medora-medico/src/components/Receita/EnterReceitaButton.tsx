import { Button } from "@heroui/react";
import { FileUser } from "lucide-react";
import { useNavigate } from "react-router";



export default function EnterReceitaButton() {
    const navigate = useNavigate();

  return (
  <>
      <Button
        variant="primary"
        size="sm"
        className="shrink-0"
        onPress={() => {
            navigate('../prescricao')
        }}
      >
        <FileUser  />
        Receita
      </Button>
  </>
  )
}