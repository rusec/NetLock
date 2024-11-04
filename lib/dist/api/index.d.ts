import { Event, LogEvent } from "../Events";
import { ValidationErrorItem } from "joi";
import { Beacon } from "../Beacon";
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
        targets: Beacon.Data[];
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
    addService(service: Beacon.service, token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    addUser(user: Beacon.user, token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    addProcess(process: Beacon.application, token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    addInterface(iface: Beacon.networkInterface, token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    deleteTarget(token: string): Promise<API.SuccessResponse | API.ErrorResponse>;
    requestToken(key: string, info: Beacon.Init): Promise<string>;
    postEvent(event: Event, token: string): Promise<API.DbTargetErrorResponse | API.ValidationError | API.SuccessResponse | API.ErrorResponse>;
}
export default Api;
//# sourceMappingURL=index.d.ts.map