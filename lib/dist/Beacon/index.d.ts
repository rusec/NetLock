import { targetApp, targetInterface, targetUser } from "../Target";
import Api from "../api";
import { Event } from "../Events";
export declare class Beacon {
    token: string | "Not Initialized";
    hostname: string;
    os: string;
    interfaces: targetInterface[];
    users: targetUser[];
    apps: targetApp[];
    api: Api;
    constructor(hostname: string, os: string, serverUrl: string, options?: {
        interfaces: targetInterface[];
        users: targetUser[];
        apps: targetApp[];
    });
    requestToken(key: string): Promise<void>;
    addUser(username: string, loggedIn?: boolean): Promise<false | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    delUser(username: string): Promise<false | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    logUser(username: string, loggedIn: boolean): Promise<false | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    groupChange(username: string, group: string): Promise<false | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    fileAccessed(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    fileCreated(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    fileDeleted(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    filePermissionsChange(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    interfaceUp(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    interfaceDown(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    interfaceCreated(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    interfaceDeleted(mac: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    interfaceIpChange(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    processCreated(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    processEnded(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    regEdit(key: string, value: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    kernel(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    config(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    _sendEvent(event: Event): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError>;
    delete(): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
}
//# sourceMappingURL=index.d.ts.map