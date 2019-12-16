import {Logger} from "./logging";
import {GMail} from "./gmail";

export class CheckerApp {

    constructor(private readonly logger: Logger,
                private readonly gmail: GMail) {
        this.logger = logger;
        this.gmail = gmail;
    }

    async checkMail() {
        this.logger.debug("checkMail started");
        if (!this.gmail.isAuthenticate) {
            await this.gmail.authenticate();
        }
        const labels: Array<any> = await this.gmail.listLabels();
        let labelsNames = "";
        labels.forEach((label: any) => {
            labelsNames += label.name + " ";
        });
        this.logger.debug('Labels:' + labelsNames);
    }
}
