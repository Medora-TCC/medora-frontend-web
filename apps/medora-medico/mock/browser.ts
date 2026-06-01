// mocks/browser.ts
import { setupWorker } from "msw/browser";
import { consultaHandlers } from "./consulta/consultaHandlers";
import { prontuarioHandler } from "./prontuario/ProntuarioHandlers";
import { availabilityHandlers } from "./Availability/AvailabiltiyHandlers";
import { profileHandlers } from "./Profile/ProfileHandlers";

export const worker = setupWorker(
    ...consultaHandlers,
    ...availabilityHandlers,
    ...prontuarioHandler,
    ...profileHandlers
);


