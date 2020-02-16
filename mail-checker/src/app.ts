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
            const msgs: Message[] = await this.gmail.getLastMessagesIds(10, "from:");
            let mails = new Array<Message>();
            for (const msg of msgs){
                mails.push(await this.gmail.getMessage(msg.id!!));                
            }
            
        } catch (e) {
            this.logger.error("checkMail failed!", e);
        }
    }
}
