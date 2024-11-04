"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.success = exports.error = exports.log = void 0;
require("colors");
const colors_1 = __importDefault(require("colors"));
const fs_1 = __importDefault(require("fs"));
const bold = colors_1.default.bold;
const logFile = "/server.log";
function logToFile(stamp, time, message) {
    let m = `${stamp} [${time}] ${message}`;
    fs_1.default.appendFile(logFile, m, () => { });
}
/**
 * Logs a message with an optional message type and override flag to the console.
 *
 * @param {string} message - The message to be logged.
 * @param {string} [type="debug"] - The type of message (e.g., "log", "debug", "warn", "error", "info", "success").
 * @returns {void} This function does not return a value.
 */
var log = (message, type = "debug") => {
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
exports.log = log;
var error = (message) => {
    log(message, "error");
};
exports.error = error;
var success = (message) => {
    log(message, "success");
};
exports.success = success;
var info = (message) => {
    log(message, "info");
};
exports.info = info;
