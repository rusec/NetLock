"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Beacon = exports.ProcessInfo = void 0;
const api_1 = __importDefault(require("../api"));
const Events_1 = require("../Events");
const ps_list_commonjs_1 = __importDefault(require("ps-list-commonjs"));
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
var ProcessInfo;
(function (ProcessInfo) {
    let Windows;
    (function (Windows) {
        Windows.defaultProcess = [];
    })(Windows = ProcessInfo.Windows || (ProcessInfo.Windows = {}));
    let Linux;
    (function (Linux) {
        Linux.defaultProcess = [];
    })(Linux = ProcessInfo.Linux || (ProcessInfo.Linux = {}));
    async function getProcess() {
        return await (0, ps_list_commonjs_1.default)();
    }
    ProcessInfo.getProcess = getProcess;
})(ProcessInfo || (exports.ProcessInfo = ProcessInfo = {}));
class Beacon {
    token;
    hostname;
    os;
    interfaces;
    users;
    apps;
    api;
    constructor(hostname, os, serverUrl, options) {
        this.hostname = hostname;
        this.os = os;
        this.interfaces = options?.interfaces || [];
        this.users = options?.users || [];
        this.apps = options?.apps || [];
        this.token = "Not Initialized";
        this.api = new api_1.default(serverUrl);
    }
    async requestToken(key) {
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
    async addUser(username, loggedIn) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index != -1)
            return false;
        let event = {
            description: "user created",
            event: Events_1.UserEvent.Types.UserCreated,
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
    async delUser(username) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1)
            return false;
        let event = {
            description: "user deleted",
            event: Events_1.UserEvent.Types.UserDeleted,
            loggedIn: false,
            user: username,
        };
        this.users.splice(index, 1);
        return await this._sendEvent(event);
    }
    async logUser(username, loggedIn) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1)
            return false;
        let event = {
            description: "user " + (loggedIn ? "logged in" : "logged out"),
            event: loggedIn ? Events_1.UserEvent.Types.UserLoggedIn : Events_1.UserEvent.Types.UserLoggedOut,
            loggedIn: loggedIn,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async groupChange(username, group) {
        let index = this.users.findIndex((u) => u.name == username);
        if (index == -1)
            return false;
        let event = {
            description: "user group change to" + group,
            event: Events_1.UserEvent.Types.UserGroupChange,
            loggedIn: false,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async fileAccessed(file, options) {
        let { username, permissions, path } = options;
        let event = {
            description: `file ${file} accessed by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: Events_1.FileEvent.Types.FileAccessed,
        };
        return await this._sendEvent(event);
    }
    async fileCreated(file, options) {
        let { username, permissions, path } = options;
        let event = {
            description: `file ${file} created by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: Events_1.FileEvent.Types.FileCreated,
        };
        return await this._sendEvent(event);
    }
    async fileDeleted(file, options) {
        let { username, permissions, path } = options;
        let event = {
            description: `file ${file} deleted by ${username}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: Events_1.FileEvent.Types.FileDeleted,
        };
        return await this._sendEvent(event);
    }
    async filePermissionsChange(file, options) {
        let { username, permissions, path } = options;
        let event = {
            description: `file ${file} permissions changed by ${username} to ${permissions}`,
            permissions: permissions,
            file: file,
            path: path,
            user: username,
            event: Events_1.FileEvent.Types.FilePermission,
        };
        return await this._sendEvent(event);
    }
    async interfaceUp(mac, ip, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${ip} ${mac} up`,
            ip: ip,
            event: Events_1.NetworkEvent.Types.InterfaceUp,
            state: "up",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceDown(mac, ip, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${ip} ${mac} down`,
            ip: ip,
            event: Events_1.NetworkEvent.Types.InterfaceDown,
            state: "down",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceCreated(mac, ip, state, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${ip} ${mac} created by ${username}`,
            ip: ip,
            event: Events_1.NetworkEvent.Types.InterfaceCreated,
            state: state,
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceDeleted(mac, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${mac} deleted by ${username}`,
            ip: "unknown",
            event: Events_1.NetworkEvent.Types.InterfaceDeleted,
            state: "down",
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async interfaceIpChange(mac, ip, state, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${ip} ${mac} Ip Change by ${username}`,
            ip: ip,
            event: Events_1.NetworkEvent.Types.InterfaceIpChange,
            state: state,
            mac: mac,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async processCreated(process) {
        let { pid, name } = process;
        let event = {
            description: `Process Created ${pid} ${name}`,
            event: Events_1.ProcessEvent.Types.ProcessCreated,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async processEnded(process) {
        let { pid, name } = process;
        let event = {
            description: `Process Ended ${pid} ${name}`,
            event: Events_1.ProcessEvent.Types.ProcessEnded,
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
        return os_1.default.networkInterfaces();
    }
    getUsers() {
        return new Promise((resolve) => {
            systeminformation_1.default.users((d) => resolve(d));
        });
    }
    async regEdit(key, value, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `Registry Edit ${key} ${value} by ${username}`,
            event: Events_1.RegEditEvent.Types.RegEdit,
            key: key,
            value: value,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async kernel(file, path, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `Kernel Edit ${path} by ${username}`,
            event: Events_1.KernelEvent.Types.Kernel,
            file: file,
            path: path,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async config(file, path, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `Config Edit ${path} by ${username}`,
            event: Events_1.KernelEvent.Types.Kernel,
            file: file,
            path: path,
            user: username,
        };
        return await this._sendEvent(event);
    }
    async _sendEvent(event) {
        if (this.token == "Not Initialized")
            throw new Error("Beacon has not been Initialized");
        let result = await this.api.postEvent(event, this.token);
        return result;
    }
    async delete() {
        if (this.token == "Not Initialized")
            throw new Error("Beacon has not been Initialized");
        let result = await this.api.deleteTarget(this.token);
        return result;
    }
}
exports.Beacon = Beacon;
