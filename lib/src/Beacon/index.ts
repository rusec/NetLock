import Api from "../api";
import { FileEvent, UserEvent, Event, NetworkEvent, ProcessEvent, RegEditEvent, KernelEvent } from "../Events";
import os from "os";
import system, { Systeminformation } from "systeminformation";
import Joi from "joi";
import * as schemas from "./schemas";
export { schemas };
export namespace ProcessInfo {
    export type ProcessName = string;
    export namespace Windows {
        export const defaultProcess: ProcessName[] = [];
    }
    export namespace Linux {
        export const defaultProcess: ProcessName[] = [];
    }
}

export class Beacon {
    token: string | "Not Initialized";
    api: Api;
    hostname: string;

    constructor(serverUrl: string) {
        this.token = "Not Initialized";
        this.api = new Api(serverUrl);
        this.hostname = "";
    }
    async requestToken(key: string) {
        this.hostname = os.hostname();
        let osInfo = await Beacon.getOS();
        let cpu = await Beacon.getCPU();
        let mem = await Beacon.getMem();
        console.log(osInfo);
        let data: Beacon.Init = {
            os: osInfo,
            hostname: this.hostname,
            hardware: {
                cpu: `${cpu.model} ${cpu.cores} ${cpu.vendor}`,
                mem: `${mem.total}`,
            },
        };
        let result = await this.api.requestToken(key, data);
        this.token = result;
    }
    static async getOS() {
        return new Promise<Systeminformation.OsData>((resolve) => {
            system.osInfo((d) => resolve(d));
        });
    }
    static getCPU() {
        return new Promise<Systeminformation.CpuData>((resolve) => {
            system.cpu((d) => resolve(d));
        });
    }
    static getMem() {
        return new Promise<Systeminformation.MemData>((resolve) => {
            system.mem((d) => resolve(d));
        });
    }
    static async getProcesses() {
        return new Promise<Systeminformation.ProcessesProcessData[]>((resolve) => {
            system.processes((d) => resolve(d.list));
        });
    }
    static async getNetworkInterfaces() {
        return new Promise<Systeminformation.NetworkInterfacesData | Systeminformation.NetworkInterfacesData[]>((resolve) => {
            system.networkInterfaces((d) => resolve(d));
        });
    }
    static getUsers() {
        return new Promise<Systeminformation.UserData[]>((resolve) => {
            system.users((d) => resolve(d));
        });
    }
    async addUser(username: string, loggedIn?: boolean) {
        let event: UserEvent.event = {
            description: "user created",
            event: UserEvent.Types.UserCreated,
            loggedIn: loggedIn || false,
            user: username,
            userLogin: {
                name: username,
                date: new Date().getTime(),
            },
        };

        return await this._sendEvent(event);
    }
    async delUser(username: string) {
        let event: UserEvent.event = {
            description: "user deleted",
            event: UserEvent.Types.UserDeleted,
            loggedIn: false,
            user: username,
            userLogin: {
                name: username,
                date: new Date().getTime(),
            },
        };
        return await this._sendEvent(event);
    }
    /**
     * User is logged if they are active on the system,
     * once user is no longer seen on the system, they are assumed to be logged out
     */
    async loginUser(userLogin: Beacon.userLogin, loggedIn: boolean) {
        let event: UserEvent.event = {
            description: "user " + (userLogin ? "logged in" : "logged out"),
            event: loggedIn ? UserEvent.Types.UserLoggedIn : UserEvent.Types.UserLoggedOut,
            loggedIn: loggedIn,
            user: userLogin.name,
            userLogin: userLogin,
        };
        return await this._sendEvent(event);
    }
    async groupChange(username: string, group: string) {
        let event: UserEvent.event = {
            description: "user group change to" + group,
            event: UserEvent.Types.UserGroupChange,
            loggedIn: false,
            user: username,
            userLogin: {
                name: username,
                date: new Date().getTime(),
            },
        };
        return await this._sendEvent(event);
    }
    async fileAccessed(
        file: string,
        options: {
            username: string | undefined;
            permissions: string;
            path: string;
        }
    ) {
        let { username, permissions, path } = options;
        let event: FileEvent.event = {
            description: `file ${file} accessed by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: FileEvent.Types.FileAccessed,
        };
        return await this._sendEvent(event);
    }
    async fileCreated(
        file: string,
        options: {
            username: string | undefined;
            permissions: string;
            path: string;
        }
    ) {
        let { username, permissions, path } = options;
        let event: FileEvent.event = {
            description: `file ${file} created by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: FileEvent.Types.FileCreated,
        };
        return await this._sendEvent(event);
    }
    async fileDeleted(
        file: string,
        options: {
            username: string | undefined;
            permissions: string;
            path: string;
        }
    ) {
        let { username, permissions, path } = options;
        let event: FileEvent.event = {
            description: `file ${file} deleted by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: FileEvent.Types.FileDeleted,
        };
        return await this._sendEvent(event);
    }
    async filePermissionsChange(
        file: string,
        options: {
            username: string | undefined;
            permissions: string;
            path: string;
        }
    ) {
        let { username, permissions, path } = options;
        let event: FileEvent.event = {
            description: `file ${file} permissions changed by ${username} to ${permissions}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: FileEvent.Types.FilePermission,
        };
        return await this._sendEvent(event);
    }
    async interfaceUp(
        descriptor: Beacon.networkInterface,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} up`,
            event: NetworkEvent.Types.InterfaceUp,
            state: "up",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDown(
        descriptor: Beacon.networkInterface,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} down`,
            event: NetworkEvent.Types.InterfaceDown,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceCreated(
        descriptor: Beacon.networkInterface,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };
        let event: NetworkEvent.event = {
            description: `interface ${descriptor.ip4} ${descriptor.mac} created by ${username}`,
            ip: descriptor.ip4,
            event: NetworkEvent.Types.InterfaceCreated,
            state: descriptor.state,
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDeleted(
        descriptor: Beacon.networkInterface,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${descriptor.mac} deleted by ${username}`,
            event: NetworkEvent.Types.InterfaceDeleted,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceIpChange(
        descriptor: Beacon.networkInterface,
        version: "4" | "6",
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} Ip Change by ${username}`,
            ip: version == "4" ? descriptor.ip4 : descriptor.ip6,
            subnet: version == "4" ? descriptor.ip4subnet : descriptor.ip6subnet,
            event: NetworkEvent.Types.InterfaceIpChange,
            mac: descriptor.mac,
            version: version,
            state: descriptor.state,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async processCreated(process: Beacon.applicationSpawn) {
        let event: ProcessEvent.event = {
            description: `Process Created ${process.pid} ${process.name}`,
            event: ProcessEvent.Types.ProcessCreated,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async processEnded(process: Beacon.applicationSpawn) {
        let event: ProcessEvent.event = {
            description: `Process Ended ${process.pid} ${process.name}`,
            event: ProcessEvent.Types.ProcessEnded,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }

    async regEdit(
        key: string,
        value: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };
        let event: RegEditEvent.event = {
            description: `Registry Edit ${key} ${value} by ${username}`,
            event: RegEditEvent.Types.RegEdit,
            key: key,
            value: value,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async kernel(
        file: string,
        path: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };
        let event: KernelEvent.event = {
            description: `Kernel Edit ${path} by ${username}`,
            event: KernelEvent.Types.Kernel,
            file: file,
            path: path,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async config(
        file: string,
        path: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };
        let event: KernelEvent.event = {
            description: `Config Edit ${path} by ${username}`,
            event: KernelEvent.Types.Kernel,
            file: file,
            path: path,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async _sendEvent(event: Event) {
        if (this.token == "Not Initialized") throw new Error("Beacon has not been Initialized");
        let result = await this.api.postEvent(event, this.token);
        return result;
    }
    async delete() {
        if (this.token == "Not Initialized") throw new Error("Beacon has not been Initialized");
        let result = await this.api.deleteTarget(this.token);
        return result;
    }
}

export namespace Beacon {
    export interface Init {
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

    export interface networkInterface {
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
        speed?: string;
        virtual?: string;
        dhcp?: string;
    }

    export interface userLogin {
        name: string;
        tty?: string;
        date: number;
        ip?: string;
        command?: string;
    }
    export interface user {
        name: string;
        loggedIn: boolean;
        lastUpdate: number;
        logins: userLogin[];
    }

    export interface applicationSpawn {
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
    }

    export interface application {
        name: string;
        running: boolean;
        spawns: applicationSpawn[];
    }
    export interface document extends Init {
        id: string;
        dateAdded: number;
        lastPing: number;
    }
    export interface initReq {
        apps: application[];
        users: user[];
        networkInterfaces: networkInterface[];
    }
    export interface Data extends document {
        apps: application[];
        users: user[];
        networkInterfaces: networkInterface[];
    }
}
