import { setupServer } from "msw/node";
import { consultaHandlers } from "./consulta/consultaHandlers";
import { availabilityHandlers } from "./Availability/AvailabiltiyHandlers";

export const server = setupServer(
    ...consultaHandlers,
    ...availabilityHandlers
);