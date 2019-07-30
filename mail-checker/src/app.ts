import {Logger} from "./logging";

export class CheckerApp {

    constructor(private readonly logger: Logger) {
        this.logger = logger;
    }

    async checkMail() {
        this.logger.debug("checkMail started");

    }
}
