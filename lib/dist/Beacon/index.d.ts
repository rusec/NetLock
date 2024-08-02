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
    addUser(username: string, loggedIn?: boolean): Promise<false | import("../api").API.StatusResponse>;
    delUser(username: string): Promise<false | import("../api").API.StatusResponse>;
    logUser(username: string, loggedIn: boolean): Promise<false | import("../api").API.StatusResponse>;
    groupChange(username: string, group: string): Promise<false | import("../api").API.StatusResponse>;
    fileAccessed(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.StatusResponse>;
    fileCreated(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.StatusResponse>;
    fileDeleted(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.StatusResponse>;
    filePermissionsChange(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").API.StatusResponse>;
    interfaceUp(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    interfaceDown(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    interfaceCreated(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    interfaceDeleted(mac: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    interfaceIpChange(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    processCreated(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    processEnded(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    regEdit(key: string, value: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    kernel(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    config(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").API.StatusResponse>;
    _sendEvent(event: Event): Promise<import("../api").API.StatusResponse>;
}
//# sourceMappingURL=index.d.ts.map