// mocks/browser.ts
import { setupWorker } from "msw/browser";
import { consultaHandlers } from "./consulta/consultaHandlers";
import { registerHandlers } from "./Register/RegisterHandlers";
import { profileHandlers } from "./Profile/ProfileHandlers";

export const worker = setupWorker(
    ...consultaHandlers,
    ...registerHandlers,
    ...profileHandlers
);


