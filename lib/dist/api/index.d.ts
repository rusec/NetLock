import { target, targetRequest } from "../Target";
import { Event, LogEvent } from "../Events";
import { ValidationErrorItem } from "joi";
export declare namespace API {
    class DbTargetError extends Error {
        hostname: string;
        constructor(hostname: string, message: string);
        toJson(): DbTargetErrorResponse;
    }
    interface ErrorResponse {
        status: "error";
        error: string;
    }
    interface ValidationError {
        status: "error";
        message: string;
        error: ValidationErrorItem | ValidationErrorItem[];
    }
    interface DbTargetErrorResponse {
        status: "error";
        hostname: string;
        message: string;
    }
    interface SuccessResponse {
        status: "success";
        message: string;
    }
    interface TargetsAndLogsResponse {
        targets: target[];
        logs: LogEvent.Log[];
    }
    interface StatusResponse {
        status: string;
    }
    interface TokenResponse {
        token: string;
    }
}
declare class Api {
    url: string;
    constructor(url: string);
    endpoint(endpoint: string): string;
    deleteTarget(token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    requestToken(key: string, info: targetRequest): Promise<string>;
    postEvent(event: Event, token: string): Promise<API.SuccessResponse | API.ErrorResponse | API.DbTargetErrorResponse | API.ValidationError>;
}
export default Api;
//# sourceMappingURL=index.d.ts.map