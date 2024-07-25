import { Level } from "level";
import { AbstractLevel, AbstractSublevel } from "abstract-level";
import { initTarget, target } from "../utils/types/target";
import { DbUser, UserDocRequest } from "./types/db";
import bcrypt from "bcrypt";
import crypto, { randomUUID } from "crypto";
import EventEmitter from "events";
import { event, targetEvent, targetLogEvent } from "../routes/types/Events";
import { removeUUIDFromString } from "./utils/utils";

type dbEventTypes = {
    logs: [event: targetLogEvent];
    target: [event: target];
};

const databaseEventEmitter: EventEmitter<dbEventTypes> = new EventEmitter({
    captureRejections: true,
});

// Note see if theres problems with how node handles promises and wrapping the data get and put functions in another promise

// It might create race conditions

class TargetData {
    data: target;
    db: AbstractSublevel<Level<string, target>, string | Buffer | Uint8Array, string, target>;
    id: string;
    logKey: string;
    logs: AbstractSublevel<
        AbstractSublevel<Level<string, target>, string | Buffer | Uint8Array, string, target>,
        string | Buffer | Uint8Array,
        string,
        targetLogEvent
    >;

    constructor(data: target, id: string, db: AbstractSublevel<Level<string, target>, string | Buffer | Uint8Array, string, target>) {
        this.data = data;
        this.db = db;
        this.id = id;
        this.logKey = `${id}_logs`;
        this.logs = this.db.sublevel(this.logKey, { valueEncoding: "json" });
    }
    async updateLastPing() {
        this.data.lastPing = new Date().getDate();
        await this._updateData();
    }
    async _updateData() {
        databaseEventEmitter.emit("target", this.data);
        await this.db.put(this.id, this.data).catch(() => undefined);
    }

    async _getCurrData() {
        let data = await this.db.get(this.id).catch(() => undefined);
        if (!data) return false;
        this.data = data;
        return true;
    }

    async updateInterfaceStat(mac: string, state: "down" | "up") {
        let result = await this._getCurrData();
        if (!result) return;
        let index = this.data.interfaces.findIndex((i) => i.mac == mac);
        if (index == -1) return false;

        this.data.interfaces[index].state = state;
        await this._updateData();
    }
    async updateUser(
        username: string,
        options: {
            loggedIn?: boolean;
            lastLogin?: number;
        }
    ) {
        let result = await this._getCurrData();
        if (!result) return;
        let index = this.data.users.findIndex((i) => i.name == username);
        if (index == -1) return false;
        if (typeof options.loggedIn == "boolean") {
            this.data.users[index].loggedIn = options.loggedIn;
        }
        if (options.lastLogin) this.data.users[index].lastUpdate = new Date(options.lastLogin).getTime();
        this.data.users[index].lastUpdate = new Date().getTime();
        await this._updateData();
    }
    async updateApp(app: string, running: boolean) {
        let result = await this._getCurrData();
        if (!result) return;

        let index = this.data.apps.findIndex((i) => i.name == app);
        if (index == -1) return false;

        this.data.apps[index].running = running;

        await this._updateData();
    }
    async addLog(event: targetLogEvent) {
        let uuid = randomUUID();
        let eventKey = `log_${new Date().toISOString()}_${this.data.hostname}_${event.event}_${uuid}`;
        databaseEventEmitter.emit("logs", event);
        this.logs.put(eventKey, event);
    }
    async getLogs() {
        let logs = [];
        for await (const key of this.logs.keys()) {
            let m = await this.logs.get(key).catch(() => "");
            if (typeof m === "string") continue;
            //might need to add a program log here just incase
            logs.push(m);
        }
        return logs;
    }
}
class DataBase {
    db: Level<string, any>;
    targets: AbstractSublevel<Level<string, target>, string | Buffer | Uint8Array, string, target>;

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
        console.log(userDoc);
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

    makeTargetId(data: initTarget) {
        let sha = crypto.createHash("sha256");
        let hash = sha.update(data.hostname);
        return hash.digest().toString("hex");
    }

    async createTarget(data: initTarget) {
        let id = this.makeTargetId(data);
        let target: target = { ...data, id: id };
        databaseEventEmitter.emit("target", target);

        await this.targets.put(id, target).catch((err) => console.log(err));
        return id;
    }
    async getTarget(id: string) {
        let userData = await this.targets.get(id).catch(() => undefined);
        if (!userData) return false;
        return new TargetData(userData, id, this.targets);
    }
    async getAllLogs() {
        let mainLogs = [];
        for await (const value of this.targets.values()) {
            let target = new TargetData(value, value.id, this.targets);
            let logs = await target.getLogs();
            mainLogs.push(logs);
        }
        let faltLogs = mainLogs.flat();
        return faltLogs.sort((a: targetLogEvent, b: targetLogEvent) => a.timestamp - b.timestamp);
    }
    async getAllTargets() {
        let data: target[] = [];
        for await (const value of this.targets.values()) {
            data.push(value);
        }
        return data;
    }
}

const db = new DataBase();
export default db;
export { databaseEventEmitter };
