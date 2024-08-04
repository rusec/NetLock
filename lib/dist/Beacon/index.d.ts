import { targetApp, targetInterface, targetUser } from "../Target";
import Api from "../api";
import { Event } from "../Events";
import { ProcessDescriptor } from "ps-list-commonjs";
import os from "os";
import system from "systeminformation";
export declare namespace ProcessInfo {
    type ProcessName = string;
    type Info = ProcessDescriptor;
    namespace Windows {
        const defaultProcess: ProcessName[];
    }
    namespace Linux {
        const defaultProcess: ProcessName[];
    }
    function getProcess(): Promise<ProcessDescriptor[]>;
}
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
    addUser(username: string, loggedIn?: boolean): Promise<false | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    delUser(username: string): Promise<false | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    logUser(username: string, loggedIn: boolean): Promise<false | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    groupChange(username: string, group: string): Promise<false | import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    fileAccessed(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    fileCreated(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    fileDeleted(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    filePermissionsChange(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceUp(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceDown(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceCreated(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceDeleted(mac: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceIpChange(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    processCreated(process: ProcessInfo.Info): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    processEnded(process: ProcessInfo.Info): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    getProcesses(): Promise<ProcessDescriptor[]>;
    getNetworkInterfaces(): NodeJS.Dict<os.NetworkInterfaceInfo[]>;
    getUsers(): Promise<system.Systeminformation.UserData[]>;
    regEdit(key: string, value: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    kernel(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    config(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    _sendEvent(event: Event): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    delete(): Promise<import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
}
//# sourceMappingURL=index.d.ts.map