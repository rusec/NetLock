import { targetApp, targetInterface, targetUser } from "../Target";
import Api from "../api";
import { FileEvent, UserEvent, Event, NetworkEvent, ProcessEvent, RegEditEvent, KernelEvent } from "../Events";
import psList, { ProcessDescriptor } from "ps-list-commonjs";
import os from "os";
import system from "systeminformation";
export namespace ProcessInfo {
    export type ProcessName = string;
    export type Info = ProcessDescriptor;
    export namespace Windows {
        export const defaultProcess: ProcessName[] = [];
    }
    export namespace Linux {
        export const defaultProcess: ProcessName[] = [];
    }
    export async function getProcess() {
        return await psList();
    }
}

export class Beacon {
    token: string | "Not Initialized";
    hostname: string;
    os: string;
    interfaces: targetInterface[];
    users: targetUser[];
    apps: targetApp[];
    api: Api;

    constructor(
        hostname: string,
        os: string,
        serverUrl: string,
        options?: {
            interfaces: targetInterface[];
            users: targetUser[];
            apps: targetApp[];
        }
    ) {
        this.hostname = hostname;
        this.os = os;
        this.interfaces = options?.interfaces || [];
        this.users = options?.users || [];
        this.apps = options?.apps || [];
        this.token = "Not Initialized";
        this.api = new Api(serverUrl);
    }
    async requestToken(key: string) {
        let result = await this.api.requestToken(key, {
            active: true,
            apps: this.apps,
            hostname: this.hostname,
            interfaces: this.interfaces,
            os: this.os,
            users: this.users,
        });
        this.token = result;
    }
    async addUser(username: string, loggedIn?: boolean) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index != -1) return false;

        let event: UserEvent.event = {
            description: "user created",
            event: UserEvent.Types.UserCreated,
            loggedIn: loggedIn || false,
            user: username,
        };
        this.users.push({
            lastLogin: loggedIn ? new Date().getTime() : new Date(0).getTime(),
            lastUpdate: new Date().getTime(),
            loggedIn: loggedIn || false,
            name: username,
        });
        return await this._sendEvent(event);
    }
    async delUser(username: string) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1) return false;

        let event: UserEvent.event = {
            description: "user deleted",
            event: UserEvent.Types.UserDeleted,
            loggedIn: false,
            user: username,
        };
        this.users.splice(index, 1);
        return await this._sendEvent(event);
    }
    async logUser(username: string, loggedIn: boolean) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1) return false;

        let event: UserEvent.event = {
            description: "user " + (loggedIn ? "logged in" : "logged out"),
            event: loggedIn ? UserEvent.Types.UserLoggedIn : UserEvent.Types.UserLoggedOut,
            loggedIn: loggedIn,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async groupChange(username: string, group: string) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1) return false;

        let event: UserEvent.event = {
            description: "user group change to" + group,
            event: UserEvent.Types.UserGroupChange,
            loggedIn: false,
            user: username,
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
        mac: string,
        ip: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${ip} ${mac} up`,
            ip: ip,
            event: NetworkEvent.Types.InterfaceUp,
            state: "up",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceDown(
        mac: string,
        ip: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${ip} ${mac} down`,
            ip: ip,
            event: NetworkEvent.Types.InterfaceDown,
            state: "down",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceCreated(
        mac: string,
        ip: string,
        state: "up" | "down",
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${ip} ${mac} created by ${username}`,
            ip: ip,
            event: NetworkEvent.Types.InterfaceCreated,
            state: state,
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceDeleted(
        mac: string,
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${mac} deleted by ${username}`,
            ip: "unknown",
            event: NetworkEvent.Types.InterfaceDeleted,
            state: "down",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceIpChange(
        mac: string,
        ip: string,
        state: "up" | "down",
        options?: {
            username: string;
        }
    ) {
        let { username } = options || { username: undefined };

        let event: NetworkEvent.event = {
            description: `interface ${ip} ${mac} Ip Change by ${username}`,
            ip: ip,
            event: NetworkEvent.Types.InterfaceIpChange,
            state: state,
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async processCreated(process: ProcessInfo.Info) {
        let { pid, name } = process;

        let event: ProcessEvent.event = {
            description: `Process Created ${pid} ${name}`,
            event: ProcessEvent.Types.ProcessCreated,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async processEnded(process: ProcessInfo.Info) {
        let { pid, name } = process;

        let event: ProcessEvent.event = {
            description: `Process Ended ${pid} ${name}`,
            event: ProcessEvent.Types.ProcessEnded,
            name: name,
            pid: pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async getProcesses() {
        return await ProcessInfo.getProcess();
    }
    getNetworkInterfaces() {
        return os.networkInterfaces();
    }
    getUsers() {
        return new Promise<system.Systeminformation.UserData[]>((resolve) => {
            system.users((d) => resolve(d));
        });
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
