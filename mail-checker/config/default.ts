import {Config} from "../src/config";

export const config: Config = {
    check_interval_minutes: 1,
    loggers: [
        {
            name: "console",
            type: "console",
            format: "pretty-json",
            level: "debug",
            timestamp: true
        }
    ]
};
