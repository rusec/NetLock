"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestBeacon = exports.Beacon = exports.ProcessInfo = exports.schemas = void 0;
const api_1 = __importDefault(require("../api"));
const Events_1 = require("../Events");
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const schemas = __importStar(require("./schemas"));
exports.schemas = schemas;
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
})(ProcessInfo || (exports.ProcessInfo = ProcessInfo = {}));
class Beacon {
    token;
    api;
    hostname;
    constructor(serverUrl) {
        this.token = "Not Initialized";
        this.api = new api_1.default(serverUrl);
        this.hostname = "";
    }
    async requestToken(key) {
        this.hostname = os_1.default.hostname();
        let osInfo = await Beacon.getOS();
        let cpu = await Beacon.getCPU();
        let mem = await Beacon.getMem();
        console.log(osInfo);
        let data = {
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
        return new Promise((resolve) => {
            systeminformation_1.default.osInfo((d) => resolve(d));
        });
    }
    static getCPU() {
        return new Promise((resolve) => {
            systeminformation_1.default.cpu((d) => resolve(d));
        });
    }
    static getMem() {
        return new Promise((resolve) => {
            systeminformation_1.default.mem((d) => resolve(d));
        });
    }
    static async getProcesses() {
        return new Promise((resolve) => {
            systeminformation_1.default.processes((d) => resolve(d.list));
        });
    }
    static async getNetworkInterfaces() {
        return new Promise((resolve) => {
            systeminformation_1.default.networkInterfaces((d) => resolve(d));
        });
    }
    static getUsers() {
        return new Promise((resolve) => {
            systeminformation_1.default.users((d) => resolve(d));
        });
    }
    async sendInit(users, ifaces, apps) {
        if (this.token == "Not Initialized")
            throw new Error("Beacon has not been Initialized");
        let initReq = {
            apps: apps,
            networkInterfaces: ifaces,
            users: users,
        };
        for (let i = 0; i < initReq.networkInterfaces.length; i++) {
            const iface = initReq.networkInterfaces[i];
            await this.api.addInterface(iface, this.token);
        }
        for (let i = 0; i < initReq.apps.length; i++) {
            const apps = initReq.apps[i];
            await this.api.addProcess(apps, this.token);
        }
        for (let i = 0; i < initReq.users.length; i++) {
            const user = initReq.users[i];
            await this.api.addUser(user, this.token);
        }
        return;
    }
    async addUser(username, loggedIn) {
        let event = {
            description: "user created",
            event: Events_1.UserEvent.Types.UserCreated,
            loggedIn: loggedIn || false,
            user: username,
            userLogin: {
                name: username,
                date: new Date().getTime(),
            },
        };
        return await this._sendEvent(event);
    }
    async delUser(username) {
        let event = {
            description: "user deleted",
            event: Events_1.UserEvent.Types.UserDeleted,
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
    async loginUser(userLogin, loggedIn) {
        let event = {
            description: "user " + (userLogin ? "logged in" : "logged out"),
            event: loggedIn ? Events_1.UserEvent.Types.UserLoggedIn : Events_1.UserEvent.Types.UserLoggedOut,
            loggedIn: loggedIn,
            user: userLogin.name,
            userLogin: userLogin,
        };
        return await this._sendEvent(event);
    }
    async groupChange(username, group) {
        let event = {
            description: "user group change to" + group,
            event: Events_1.UserEvent.Types.UserGroupChange,
            loggedIn: false,
            user: username,
            userLogin: {
                name: username,
                date: new Date().getTime(),
            },
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
    async interfaceUp(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} up`,
            event: Events_1.NetworkEvent.Types.InterfaceUp,
            state: "up",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDown(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} down`,
            event: Events_1.NetworkEvent.Types.InterfaceDown,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceCreated(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.ip4} ${descriptor.mac} created by ${username}`,
            ip: descriptor.ip4,
            event: Events_1.NetworkEvent.Types.InterfaceCreated,
            state: descriptor.state,
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDeleted(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.mac} deleted by ${username}`,
            event: Events_1.NetworkEvent.Types.InterfaceDeleted,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceIpChange(descriptor, version, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} Ip Change by ${username}`,
            ip: version == "4" ? descriptor.ip4 : descriptor.ip6,
            subnet: version == "4" ? descriptor.ip4subnet : descriptor.ip6subnet,
            event: Events_1.NetworkEvent.Types.InterfaceIpChange,
            mac: descriptor.mac,
            version: version,
            state: descriptor.state,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async processCreated(process) {
        let event = {
            description: `Process Created ${process.pid} ${process.name}`,
            event: Events_1.ProcessEvent.Types.ProcessCreated,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async processEnded(process) {
        let event = {
            description: `Process Ended ${process.pid} ${process.name}`,
            event: Events_1.ProcessEvent.Types.ProcessEnded,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
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
class TestBeacon extends Beacon {
    constructor(hostname, serverUrl) {
        super(serverUrl);
        this.hostname = hostname;
    }
    async requestToken(key) {
        this.hostname = this.hostname;
        let osInfo = await Beacon.getOS();
        let cpu = await Beacon.getCPU();
        let mem = await Beacon.getMem();
        let data = {
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
}
exports.TestBeacon = TestBeacon;
