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
    addUser(username: string, loggedIn?: boolean): Promise<false | import("../api").ApiStatusResponse>;
    delUser(username: string): Promise<false | import("../api").ApiStatusResponse>;
    logUser(username: string, loggedIn: boolean): Promise<false | import("../api").ApiStatusResponse>;
    groupChange(username: string, group: string): Promise<false | import("../api").ApiStatusResponse>;
    fileAccessed(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").ApiStatusResponse>;
    fileCreated(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").ApiStatusResponse>;
    fileDeleted(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").ApiStatusResponse>;
    filePermissionsChange(file: string, options: {
        username: string | undefined;
        permissions: string;
        path: string;
    }): Promise<import("../api").ApiStatusResponse>;
    interfaceUp(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    interfaceDown(mac: string, ip: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    interfaceCreated(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    interfaceDeleted(mac: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    interfaceIpChange(mac: string, ip: string, state: "up" | "down", options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    processCreated(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    processEnded(name: string, pid: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    regEdit(key: string, value: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    kernel(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    config(file: string, path: string, options?: {
        username: string;
    }): Promise<import("../api").ApiStatusResponse>;
    _sendEvent(event: Event): Promise<import("../api").ApiStatusResponse>;
}
//# sourceMappingURL=index.d.ts.map