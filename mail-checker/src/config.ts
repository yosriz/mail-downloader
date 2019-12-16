import {LogTarget} from "./logging";

export interface Config {
    check_interval_minutes: number;
    loggers?: LogTarget[];
}
