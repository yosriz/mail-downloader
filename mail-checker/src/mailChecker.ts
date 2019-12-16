import {CronJob} from "cron";
import {Logger} from "./logging";
import {config} from "../config/default";
import {CheckerApp} from "./app";
import {GMail} from "./gmail";

const logger = Logger.init(...config.loggers!);
const app = new CheckerApp(logger, new GMail(logger));

new CronJob({
    cronTime: `*/${config.check_interval_minutes} * * * *`,
    runOnInit: true,
    onTick: async () => {
        await app.checkMail();
    }
})
    .start();
