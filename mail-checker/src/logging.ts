import * as winston from "winston";
import { FileTransportOptions, GenericTextTransportOptions, GenericTransportOptions } from "winston";

export interface LogTarget {
    name: string;
    type: "console" | "file";
    level: "debug" | "info" | "warn" | "error";
    format?: "string" | "json" | "pretty-json"; // default to "string"
    timestamp?: boolean | (() => string | boolean);
}

export interface ConsoleTarget extends LogTarget {
    type: "console";
    name: "console";
}

export interface FileTarget extends LogTarget {
    type: "file";
    file: string;
}

type WinstonTransportOptions = GenericTransportOptions & GenericTextTransportOptions & { stringify?: boolean };

function createTarget(target: LogTarget): winston.TransportInstance {
    let cls: { new(options: WinstonTransportOptions): winston.TransportInstance };
    const defaults: WinstonTransportOptions = {
        timestamp: true,
    };
    const options: WinstonTransportOptions = {
        level: target.level,
        timestamp: target.timestamp,
    };

    if (target.format === "json" || target.format === "pretty-json") {
        options.json = true;
    }

    if (target.format === "json") {
        (options.stringify as boolean) = true;
    }

    switch (target.type) {
        case "console":
            defaults.level = "debug";
            cls = winston.transports.Console;
            break;

        case "file":
            defaults.level = "error";
            (options as FileTransportOptions).filename = (target as FileTarget).file;
            cls = winston.transports.File;
            break;

        default:
            throw new Error("unsupported log target type: " + target.type);
    }

    return new cls(mergeOptions(defaults, options));
}

type OptionsKey = keyof WinstonTransportOptions;

function mergeOptions(defaults: WinstonTransportOptions, options: WinstonTransportOptions): WinstonTransportOptions {
    const result = Object.assign({}, defaults);

    (Object.keys(options) as OptionsKey[])
        .filter(key => options[key] !== null && options[key] !== undefined)
        .forEach(key => result[key] = options[key]);

    return result;
}

export interface Logger {
    error(message: string, err?: any, options?: object): void;

    warn(message: string, options?: object): void;

    verbose(message: string, options?: object): void;

    info(message: string, options?: object): void;

    debug(message: string, options?: object): void;
}

export namespace Logger {

    export function init(...targets: LogTarget[]): Logger {

        const winstonLogger = new winston.Logger({
            transports: targets.map(target => createTarget(target))
        });

        return {
            error: (message: string, error?: any, options?: object) => {
                const data = {
                    error: error ? error.toString() : undefined,
                    ...options
                }
                winstonLogger.error(message, data);
            },
            warn: (message: string, options?: object) => {
                winstonLogger.warn(message, { ...options });
            },
            verbose: (message: string, options?: object) => {
                winstonLogger.verbose(message, { ...options });
            },
            info: (message: string, options?: object) => {
                winstonLogger.info(message, { ...options });
            },
            debug: (message: string, options?: object) => {
                winstonLogger.debug(message, { ...options });
            }
        };
    }
}
