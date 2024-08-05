import "colors";

import color from "colors";
import fs from "fs";
const bold = color.bold;

const logFile = "/server.log";

function logToFile(stamp: string, time: string, message: string) {
    let m = `${stamp} [${time}] ${message}`;
    fs.appendFile(logFile, m, () => {});
}

export type options = "log" | "debug" | "warn" | "error" | "info" | "success" | undefined;
/**
 * Logs a message with an optional message type and override flag to the console.
 *
 * @param {string} message - The message to be logged.
 * @param {string} [type="debug"] - The type of message (e.g., "log", "debug", "warn", "error", "info", "success").
 * @param {boolean} [override=false] - If true, the message type is overridden by the provided type.
 * @returns {void} This function does not return a value.
 */
var log = (message: string, type: options = "debug"): void => {
    let t;
    switch (type.toLowerCase()) {
        default:
        case "log":
            t = "[LOG] ".blue;
            break;
        case "debug":
            t = "[DEBUG] ".green;
            break;
        case "warn":
            t = "[WARNING] ".yellow;
            break;
        case "error":
            t = "[ERROR] ".red;
            break;
        case "info":
            t = "[MESSAGE] ".magenta;
            break;
        case "success":
            t = bold("[SUCCESS]".green);
            break;
    }
    let time = new Date().toISOString();
    console.log(t, `[${time}]`, message);
    logToFile(t, time, message);
};
var error = (message: any) => {
    log(message, "error");
};
var success = (message: any) => {
    log(message, "success");
};
var info = (message: any) => {
    log(message, "info");
};

export { log, error, success, info };
