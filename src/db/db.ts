import { Level } from "level";
import { AbstractSublevel } from "abstract-level";
import { DbUser, UserDocRequest } from "./types/db";
import bcrypt from "bcrypt";
import crypto, { randomUUID } from "crypto";
import EventEmitter from "events";
import { removeFromArray, removeValueFromArray } from "./utils/utils";
import { LogEvent } from "netlocklib/dist/Events";
import { initTarget, target } from "netlocklib/dist/Target";
import { API } from "netlocklib/dist/api";
import { Beacon } from "netlocklib/dist/Beacon";

type dbEventTypes = {
    logs: [event: LogEvent.Log];
    target: [event: Beacon.Data];
};

const databaseEventEmitter: EventEmitter<dbEventTypes> = new EventEmitter({
    captureRejections: true,
});

// Note see if theres problems with how node handles promises and wrapping the data get and put functions in another promise

// It might create race conditions
// Need to add create and delete for interfaces apps and users
class BeaconData {
    data: Beacon.document;
    db: AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>;
    id: string;
    _logKey: string;
    _logs: AbstractSublevel<
        AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>,
        string | Buffer | Uint8Array,
        string,
        LogEvent.Log
    >;
    _networkKey: string;
    _userKey: string;
    _applicationKey: string;
    _network: AbstractSublevel<
        AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>,
        string | Buffer | Uint8Array,
        string,
        Beacon.networkInterface
    >;
    _applications: AbstractSublevel<
        AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>,
        string | Buffer | Uint8Array,
        string,
        Beacon.application
    >;
    _users: AbstractSublevel<
        AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>,
        string | Buffer | Uint8Array,
        string,
        Beacon.user
    >;

    constructor(
        data: Beacon.document,
        id: string,
        db: AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>
    ) {
        this.data = data;
        this.db = db;
        this.id = id;
        this._logKey = `${id}_logs`;
        this._networkKey = `${id}_interfaces`;
        this._userKey = `${id}_user`;
        this._applicationKey = `${id}_application`;
        this._logs = this.db.sublevel(this._logKey, { valueEncoding: "json" });
        this._network = this.db.sublevel(this._networkKey, { valueEncoding: "json" });
        this._applications = this.db.sublevel(this._applicationKey, { valueEncoding: "json" });
        this._users = this.db.sublevel(this._userKey, { valueEncoding: "json" });
    }
    async updateLastPing() {
        this.data.lastPing = new Date().getDate();
        await this._updateData();
    }
    async getData() {
        let apps: Beacon.application[] = [];
        for await (const app of this._applications.values()) {
            apps.push(app);
        }
        let networkInterfaces: Beacon.networkInterface[] = [];
        for await (const iface of this._network.values()) {
            networkInterfaces.push(iface);
        }
        let users: Beacon.user[] = [];
        for await (const user of this._users.values()) {
            users.push(user);
        }
        let data: Beacon.Data = { ...this.data, apps, networkInterfaces, users };
        return data;
    }

    async _updateData() {
        let data = await this.getData();
        if (data instanceof API.DbTargetError) return;
        databaseEventEmitter.emit("target", data);
    }

    async _getCurrData() {
        let data = await this.db.get(this.id).catch(() => undefined);
        if (!data) return new API.DbTargetError(this.data.hostname, `Unable to get current data for target`);
        this.data = data;
        return true;
    }

    async updateInterfaceStat(mac: string, state: "down" | "up") {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let iface = await this._network.get(mac).catch(() => undefined);
        if (!iface) return new API.DbTargetError(this.data.hostname, `Unable to find interface ${mac}`);

        iface.state = state;
        await this._network.put(mac, iface).catch(() => undefined);
        this._updateData();
        return true;
    }
    async addInterface(ifaceRequest: Beacon.networkInterface) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let iface = await this._network.get(ifaceRequest.mac).catch(() => undefined);
        if (iface) return new API.DbTargetError(this.data.hostname, `Interface already added`);

        await this._network.put(ifaceRequest.mac, ifaceRequest).catch(() => undefined);
        this._updateData();

        return true;
    }
    async updateInterfaceIPv4(mac: string, ip: string, subnet: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;
        let iface = await this._network.get(mac).catch(() => undefined);
        if (!iface) return new API.DbTargetError(this.data.hostname, `Unable to find interface ${mac}`);

        iface.ip4 = ip;
        iface.ip4subnet = subnet;

        await this._network.put(iface.mac, iface).catch(() => undefined);
        this._updateData();

        return true;
    }
    async updateInterfaceIPv6(mac: string, ip: string, subnet: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;
        let iface = await this._network.get(mac).catch(() => undefined);
        if (!iface) return new API.DbTargetError(this.data.hostname, `Unable to find interface ${mac}`);

        iface.ip6 = ip;
        iface.ip6subnet = subnet;

        await this._network.put(iface.mac, iface).catch(() => undefined);
        this._updateData();

        return true;
    }
    async removeInterface(mac: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        await this._network.del(mac).catch(() => undefined);

        return true;
    }
    async addUser(username: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;
        let user = await this._users.get(username).catch(() => undefined);
        if (user) return new API.DbTargetError(this.data.hostname, `User ${username} already exists`);

        let userDoc: Beacon.user = {
            logins: [],
            loggedIn: false,
            lastUpdate: new Date().getTime(),
            name: username,
        };
        await this._users.put(username, userDoc).catch(() => undefined);
        this._updateData();

        return true;
    }
    async removeUser(username: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;
        let user = await this._users.get(username).catch(() => undefined);
        if (!user) return new API.DbTargetError(this.data.hostname, `User ${username} doesn't exist`);

        await this._users.del(username).catch(() => undefined);
        this._updateData();

        return true;
    }
    async updateUser(username: string, logInRequest: Beacon.userLogin) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let user = await this._users.get(username).catch(() => undefined);
        if (!user) return new API.DbTargetError(this.data.hostname, `User ${username} doesn't exist`);

        user.logins.push(logInRequest);
        user.lastUpdate = new Date().getTime();
        user.loggedIn = true;

        await this._users.put(username, user).catch(() => undefined);
        this._updateData();

        return true;
    }
    async userLogout(username: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let user = await this._users.get(username).catch(() => undefined);
        if (!user) return new API.DbTargetError(this.data.hostname, `User ${username} doesn't exist`);

        user.lastUpdate = new Date().getTime();
        user.loggedIn = false;

        await this._users.put(username, user).catch(() => undefined);
        this._updateData();

        return true;
    }
    async processCreated(app: Beacon.applicationSpawn, version: string = "unknown") {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let appDoc = await this._applications.get(app.name).catch(() => undefined);
        // if app doesn't exist add it.
        if (!appDoc) {
            appDoc = {
                name: app.name,
                running: true,
                spawns: [app],
            };
        } else {
            appDoc.spawns.push(app);
        }
        await this._applications.put(app.name, appDoc).catch(() => undefined);

        this._updateData();
        return true;
    }
    async processEnded(name: string) {
        let result = await this._getCurrData();
        if (result instanceof API.DbTargetError) return result;

        let appDoc = await this._applications.get(name).catch(() => undefined);
        if (!appDoc) {
            return new API.DbTargetError(this.data.hostname, `Application Not Found ${name}`);
        }
        appDoc.running = false;

        await this._applications.put(name, appDoc).catch(() => undefined);
        this._updateData();

        return true;
    }
    async addLog(event: LogEvent.BeaconEvent) {
        let uuid = randomUUID();
        let eventKey = `log_${new Date().toISOString()}_${this.data.hostname}_${event.event}_${uuid}`;
        let e: LogEvent.Log = { ...event, targetId: this.id, id: uuid.toString(), timestamp: new Date().getTime() };
        databaseEventEmitter.emit("logs", e);
        this._logs.put(eventKey, e);
        return true;
    }
    async getLogs() {
        let logs = [];
        for await (const key of this._logs.keys()) {
            let m = await this._logs.get(key).catch(() => "");
            if (typeof m === "string") continue;
            //might need to add a program log here just incase
            logs.push(m);
        }

        return logs;
    }
    async delTarget() {
        await this._network.clear();
        await this._applications.clear();
        await this._users.clear();
        await this._logs.clear();
        await this.db.del(this.id).catch(() => undefined);
        return true;
    }
}
class DataBase {
    db: Level<string, any>;
    targets: AbstractSublevel<Level<string, Beacon.document>, string | Buffer | Uint8Array, string, Beacon.document>;

    constructor() {
        this.db = new Level("./db", {
            valueEncoding: "json",
        });
        this.targets = this.db.sublevel("targets", { valueEncoding: "json" });
    }
    async fetchUser() {
        let user: DbUser = await this.db.get("user").catch(() => undefined);
        if (!user) return false;
        return user;
    }
    async login(password: string) {
        let user = await this.fetchUser();
        if (!user || !user.password) return false;
        let result = bcrypt.compareSync(password, user.password);
        if (!result) return false;
        user.totalLogging += 1;
        user.lastLogging = new Date().getTime();
        await this.db.put("user", user);
        return true;
    }
    async createUser(newUser: UserDocRequest) {
        let user = await this.fetchUser();
        if (user) return false;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newUser.password, salt);

        let userDoc: DbUser = {
            ip: newUser.ip,
            password: hash,
            totalLogging: 1,
            lastLogging: new Date().getTime(),
        };
        await this.db.put("user", userDoc);
        return true;
    }
    async setPassword(password: string) {
        let user = await this.fetchUser();
        if (!user) return false;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;
        await this.db.put("user", user);
        return true;
    }

    makeTargetId(data: Beacon.Init) {
        let sha = crypto.createHash("sha256");
        let hash = sha.update(data.hostname);
        return hash.digest().toString("hex");
    }

    async createTarget(data: Beacon.Init) {
        let id = this.makeTargetId(data);

        // Need to standardize input here. some values are needed for the rest of the code but not for initial setup

        let target: Beacon.document = { ...data, id: id, dateAdded: new Date().getTime(), lastPing: new Date().getTime() };
        databaseEventEmitter.emit("target", { ...target, apps: [], networkInterfaces: [], users: [] });

        await this.targets.put(id, target).catch((err) => console.log(err));
        return id;
    }
    async getBeacon(id: string) {
        let userData = await this.targets.get(id).catch(() => undefined);
        if (!userData) return false;
        return new BeaconData(userData, id, this.targets);
    }
    async getAllLogs() {
        let mainLogs = [];
        for await (const [key, value] of this.targets.iterator()) {
            if (key.includes("_logs")) continue;
            let target = new BeaconData(value, value.id, this.targets);
            let logs = await target.getLogs();
            mainLogs.push(logs);
        }
        let flatLogs = mainLogs.flat();
        return flatLogs.sort((a: LogEvent.Log, b: LogEvent.Log) => a.timestamp - b.timestamp);
    }
    async getAllTargets() {
        let data: Beacon.Data[] = [];
        for await (const [key, value] of this.targets.iterator()) {
            // Figure out a better way to store these because levelDb returns sublevel keys too
            if (key.includes("_logs") || key.includes("_application") || key.includes("_user") || key.includes("_interfaces")) continue;

            let beacon = new BeaconData(value, key, this.targets);
            let d = await beacon.getData();
            if (d instanceof API.DbTargetError) continue;
            data.push(d);
        }
        return data;
    }
}

const db = new DataBase();
export default db;
export { databaseEventEmitter };
