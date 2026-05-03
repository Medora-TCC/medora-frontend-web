import { setupServer } from "msw/node";
import { teleconsultaHandlers } from "./teleconsulta/teleconsultaHandlers";

export const server = setupServer(...teleconsultaHandlers);