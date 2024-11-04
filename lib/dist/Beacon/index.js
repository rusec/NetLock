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
const child_process_1 = require("child_process");
const Events_1 = require("../Events");
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const schemas = __importStar(require("./schemas"));
exports.schemas = schemas;
const delay_1 = __importDefault(require("../utils/delay"));
const difference_1 = require("../utils/difference");
const output_1 = require("../utils/output");
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
    processes = [];
    users;
    interfaces;
    scanInterval;
    connections;
    listening;
    active;
    ready;
    constructor(serverUrl) {
        this.token = "Not Initialized";
        this.api = new api_1.default(serverUrl);
        this.hostname = "";
        this.scanInterval = 1000;
        this.users = [];
        this.interfaces = [];
        this.connections = [];
        this.listening = [];
        this.active = false;
        this.ready = false;
    }
    async requestToken(key) {
        this.hostname = os_1.default.hostname();
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
    async init() {
        let ifaces = await Beacon.getNetworkInterfaces();
        let users = (await Beacon.getAllUsers()).map((u) => {
            let user = {
                lastUpdate: new Date().getTime(),
                loggedIn: false,
                logins: [],
                name: u,
            };
            return user;
        });
        let apps = (await Beacon.getProcesses()).map((a) => {
            let app = {
                name: a.name,
                running: true,
                spawns: [a],
            };
            return app;
        });
        let services = await Beacon.getNetworkListening();
        let networkInterfaces;
        networkInterfaces = ifaces.map((i) => {
            return { ...i, state: i.operstate === "up" ? "up" : "down" };
        });
        await this.sendInit(users, networkInterfaces, apps, services);
        this.ready = true;
    }
    // Listening functions
    async startListening() {
        this.active = true;
        if (!this.ready)
            await this.init();
        (0, output_1.log)(`Listening`, 'log');
        this.scanProcesses();
        this.scanUsers();
    }
    async stopListening() {
        this.active = false;
        (0, output_1.log)(`Listening Stopped`, 'log');
    }
    async scanProcesses() {
        if (!this.active)
            return;
        let currentProcesses = await Beacon.getProcesses();
        let [endedProcesses, createdProcesses] = (0, difference_1.difference)(this.processes, currentProcesses);
        let eventPromises = [
            ...endedProcesses.map((p) => this.processEndedEvent(p)),
            ...createdProcesses.map((p) => this.processCreatedEvent(p)),
        ];
        // Update processes for the next scan
        this.processes = [...currentProcesses];
        await Promise.allSettled(eventPromises);
        await (0, delay_1.default)(this.scanInterval);
        this.scanProcesses();
    }
    async scanUsers() {
        if (!this.active)
            return;
        let currentUsers = await Beacon.getUsers();
        let [userLoggedOut, usersLoggedIn] = (0, difference_1.difference)(this.users, currentUsers);
        // Need to implement when a new user is created which is not on the server 
        let userEvents = [
            ...userLoggedOut.map((u) => this.loginUserEvent({ ...u, name: u.user, date: new Date(u.date).getTime() }, false)),
            ...usersLoggedIn.map((u) => this.loginUserEvent({ ...u, name: u.user, date: new Date(u.date).getTime() }, true))
        ];
        this.users = [...currentUsers];
        await Promise.allSettled(userEvents);
        await (0, delay_1.default)(this.scanInterval);
        this.scanUsers();
    }
    async scanInterfaces() {
        let currentInterfaces = await Beacon.getNetworkInterfaces();
        let [oldInterfaces, newInterfaces] = (0, difference_1.difference)(this.interfaces, currentInterfaces);
        this.interfaces = [...currentInterfaces];
        await (0, delay_1.default)(this.scanInterval);
        this.scanInterfaces();
    }
    async scanConnections() {
        let currentConnections = await Beacon.getNetworkConnections();
        let [oldConnections, newConnections] = (0, difference_1.difference)(this.connections, currentConnections);
        this.connections = [...currentConnections];
        await (0, delay_1.default)(this.scanInterval);
        this.scanConnections();
    }
    async scanListening() {
        let currentListening = await Beacon.getNetworkListening();
        let [oldListening, newListening] = (0, difference_1.difference)(this.listening, currentListening);
        this.listening = [...currentListening];
        await (0, delay_1.default)(this.scanInterval);
        this.scanListening();
    }
    // Getter functions
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
            systeminformation_1.default.networkInterfaces((d) => {
                if (!(d instanceof Array)) {
                    resolve([d]);
                }
                else
                    resolve(d);
            });
        });
    }
    static async getNetworkConnections() {
        return new Promise((resolve) => {
            systeminformation_1.default.networkConnections((d) => {
                systeminformation_1.default.processes((p) => {
                    let processed = d.map((v) => {
                        let pid = v.pid;
                        let pro = p.list.find((val) => val.pid == pid);
                        return { service: pro, port: v };
                    });
                    resolve(processed);
                });
            });
        });
    }
    static async getNetworkListening() {
        return new Promise((resolve) => {
            systeminformation_1.default.networkConnections((d) => {
                systeminformation_1.default.processes((p) => {
                    let processed = d
                        .filter((v) => v.state.toLowerCase() == "listening" ||
                        v.state.toLowerCase() == "listen")
                        .map((v) => {
                        let pid = v.pid;
                        let pro = p.list.find((val) => val.pid == pid);
                        return { service: pro, port: v };
                    });
                    resolve(processed);
                });
            });
        });
    }
    static getUsers() {
        return new Promise((resolve) => {
            systeminformation_1.default.users((d) => resolve(d));
        });
    }
    static async getAllUsers() {
        let command;
        // Determine the platform
        if (process.platform === 'win32') {
            // Windows command to get users
            command = 'powershell -Command "Get-LocalUser | Select-Object -ExpandProperty Name"';
        }
        else if (process.platform === 'darwin') {
            // macOS command to get users
            command = 'dscl . list /Users';
        }
        else {
            // Linux command to get users
            command = 'cut -d: -f1 /etc/passwd';
        }
        try {
            const stdout = (0, child_process_1.execSync)(command);
            if (!stdout)
                throw new Error("No output");
            const users = stdout.toString().split('\n').map((user) => user.trim()).filter((user) => user);
            return users;
        }
        catch (error) {
            console.log(error);
            console.error('Error fetching users:', error);
            return [];
        }
    }
    async sendInit(users, ifaces, apps, services) {
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
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            await this.api.addService(service, this.token);
        }
        return;
    }
    async addUserEvent(username, loggedIn) {
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
    async delUserEvent(username) {
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
    async loginUserEvent(userLogin, loggedIn) {
        let event = {
            description: "user " + (userLogin ? "logged in" : "logged out"),
            event: loggedIn
                ? Events_1.UserEvent.Types.UserLoggedIn
                : Events_1.UserEvent.Types.UserLoggedOut,
            loggedIn: loggedIn,
            user: userLogin.name,
            userLogin: userLogin,
        };
        return await this._sendEvent(event);
    }
    async groupChangeEvent(username, group) {
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
    async fileAccessedEvent(file, options) {
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
    async fileCreatedEvent(file, options) {
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
    async fileDeletedEvent(file, options) {
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
    async filePermissionsChangeEvent(file, options) {
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
    async interfaceUpEvent(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} up`,
            event: Events_1.NetworkInterfaceEvent.Types.InterfaceUp,
            state: "up",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDownEvent(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} down`,
            event: Events_1.NetworkInterfaceEvent.Types.InterfaceDown,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceCreatedEvent(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.ip4} ${descriptor.mac} created by ${username}`,
            ip: descriptor.ip4,
            event: Events_1.NetworkInterfaceEvent.Types.InterfaceCreated,
            state: descriptor.state,
            mac: descriptor.mac,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceDeletedEvent(descriptor, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.mac} deleted by ${username}`,
            event: Events_1.NetworkInterfaceEvent.Types.InterfaceDeleted,
            state: "down",
            mac: descriptor.mac,
            user: username,
            descriptor,
        };
        return await this._sendEvent(event);
    }
    async interfaceIpChangeEvent(descriptor, version, options) {
        let { username } = options || { username: undefined };
        let event = {
            description: `interface ${descriptor.iface} ${descriptor.mac} Ip Change by ${username}`,
            ip: version == "4" ? descriptor.ip4 : descriptor.ip6,
            subnet: version == "4" ? descriptor.ip4subnet : descriptor.ip6subnet,
            event: Events_1.NetworkInterfaceEvent.Types.InterfaceIpChange,
            mac: descriptor.mac,
            version: version,
            state: descriptor.state,
            user: username,
            descriptor: descriptor,
        };
        return await this._sendEvent(event);
    }
    async processCreatedEvent(process) {
        let event = {
            description: `Process Created ${process.pid} ${process.name}`,
            event: Events_1.ProcessEvent.Types.ProcessCreated,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async processEndedEvent(process) {
        let event = {
            description: `Process Ended ${process.pid} ${process.name}`,
            event: Events_1.ProcessEvent.Types.ProcessEnded,
            name: process.name,
            pid: process.pid.toString(),
            descriptor: process,
        };
        return await this._sendEvent(event);
    }
    async regEditEvent(key, value, options) {
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
    async kernelEvent(file, path, options) {
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
    async configEvent(file, path, options) {
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
