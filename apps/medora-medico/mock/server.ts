import { setupServer } from "msw/node";
import { consultaHandlers } from "./consulta/consultaHandlers";

export const server = setupServer(
    ...consultaHandlers
);