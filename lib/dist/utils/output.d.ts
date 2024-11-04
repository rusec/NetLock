import "colors";
export type options = "log" | "debug" | "warn" | "error" | "info" | "success" | undefined;
/**
 * Logs a message with an optional message type and override flag to the console.
 *
 * @param {string} message - The message to be logged.
 * @param {string} [type="debug"] - The type of message (e.g., "log", "debug", "warn", "error", "info", "success").
 * @returns {void} This function does not return a value.
 */
declare var log: (message: string, type?: options) => void;
declare var error: (message: any) => void;
declare var success: (message: any) => void;
declare var info: (message: any) => void;
export { log, error, success, info };
//# sourceMappingURL=output.d.ts.map