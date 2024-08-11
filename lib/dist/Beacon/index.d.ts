import Api from "../api";
import { Event } from "../Events";
import { Systeminformation } from "systeminformation";
import * as schemas from "./schemas";
export { schemas };
export declare namespace ProcessInfo {
    type ProcessName = string;
    namespace Windows {
        const defaultProcess: ProcessName[];
    }
    namespace Linux {
        const defaultProcess: ProcessName[];
    }
}
export declare class Beacon {
    token: string | "Not Initialized";
    api: Api;
    hostname: string;
    static processes: Systeminformation.ProcessesProcessData[];
    static processedUpdatedAt: number;
    constructor(serverUrl: string);
    requestToken(key: string): Promise<void>;
    static getOS(): Promise<Systeminformation.OsData>;
    static getCPU(): Promise<Systeminformation.CpuData>;
    static getMem(): Promise<Systeminformation.MemData>;
    static getProcesses(): Promise<Systeminformation.ProcessesProcessData[]>;
    static getNetworkInterfaces(): Promise<Systeminformation.NetworkInterfacesData | Systeminformation.NetworkInterfacesData[]>;
    static getNetworkConnections(): Promise<Beacon.service[]>;
    static getNetworkListening(): Promise<Beacon.service[]>;
    static getUsers(): Promise<Systeminformation.UserData[]>;
    sendInit(users: Beacon.user[], ifaces: Beacon.networkInterface[], apps: Beacon.application[], services: Beacon.service[]): Promise<void>;
    addUser(username: string, loggedIn?: boolean): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    delUser(username: string): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    /**
     * User is logged if they are active on the system,
     * once user is no longer seen on the system, they are assumed to be logged out
     */
    loginUser(userLogin: Beacon.userLogin, loggedIn: boolean): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    groupChange(username: string, group: string): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
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
    interfaceUp(descriptor: Beacon.networkInterface, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceDown(descriptor: Beacon.networkInterface, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceCreated(descriptor: Beacon.networkInterface, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceDeleted(descriptor: Beacon.networkInterface, options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    interfaceIpChange(descriptor: Beacon.networkInterface, version: "4" | "6", options?: {
        username: string;
    }): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    processCreated(process: Beacon.applicationSpawn): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
    processEnded(process: Beacon.applicationSpawn): Promise<import("../api").API.DbTargetErrorResponse | import("../api").API.ValidationError | import("../api").API.SuccessResponse | import("../api").API.ErrorResponse>;
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
export declare class TestBeacon extends Beacon {
    constructor(hostname: string, serverUrl: string);
    requestToken(key: string): Promise<void>;
}
export declare namespace Beacon {
    interface Init {
        os: {
            platform: string;
            distro: string;
            kernel: string;
            arch: string;
            release: string;
            codename: string;
            fqdn: string;
            hypervisor?: boolean;
            uefi?: boolean | null;
            logofile?: string;
            build?: string;
            servicepack?: string;
        };
        hardware: {
            cpu: string;
            mem: string;
        };
        hostname: string;
    }
    interface port {
        protocol: string;
        localAddress: string;
        localPort: string;
        peerAddress?: string;
        peerPort?: string;
        state: string;
        pid: number;
        process?: string;
        [key: string]: any;
    }
    interface service {
        service: applicationSpawn | undefined;
        port: port;
    }
    interface networkInterface {
        iface: string;
        ifaceName: string;
        default: boolean;
        ip4: string;
        ip4subnet: string;
        ip6: string;
        ip6subnet: string;
        mac: string;
        state: "up" | "down";
        type?: string;
        speed?: number | null;
        virtual?: boolean;
        dhcp?: boolean;
    }
    interface userLogin {
        name: string;
        tty?: string;
        date: number;
        ip?: string;
        command?: string;
    }
    interface user {
        name: string;
        loggedIn: boolean;
        lastUpdate: number;
        logins: userLogin[];
    }
    interface applicationSpawn {
        pid: number;
        parentPid?: number;
        name: string;
        cpu?: number;
        priority?: number;
        started?: string;
        state?: string;
        tty?: string;
        user?: string;
        command?: string;
        params?: string;
        path?: string;
        [key: string]: any;
    }
    interface application {
        name: string;
        running: boolean;
        spawns: applicationSpawn[];
    }
    interface document extends Init {
        id: string;
        dateAdded: number;
        lastPing: number;
    }
    interface initReq {
        apps: application[];
        users: user[];
        networkInterfaces: networkInterface[];
    }
    interface Data extends document {
        apps: application[];
        users: user[];
        networkInterfaces: networkInterface[];
        services: service[];
    }
}
//# sourceMappingURL=index.d.ts.map