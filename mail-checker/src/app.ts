import { Logger } from "./logging";
import { GMail, Message } from "./gmail";
import { gmail_v1 } from "googleapis";

export class CheckerApp {

    constructor(private readonly logger: Logger,
        private readonly gmail: GMail) {
        this.logger = logger;
        this.gmail = gmail;
    }

    async checkMail() {
        try {
            this.logger.debug("checkMail started");
            if (!this.gmail.isAuthenticate) {
                await this.gmail.authenticate();
            }
            const msgs: Message[] = await this.gmail.getLastMessagesIds(10, "from:brooks-keret.co.il");            
            let msgsNames = "";
            msgs.forEach(async  msg => {
                const fullMsg = await this.gmail.getMessage(msg.id!!);
                msgsNames += msg.snippet + " .";
            });
            this.logger.debug('Messages: ' + msgsNames);
        } catch (e) {
            this.logger.error("checkMail failed!", e);
        }
    }
}
