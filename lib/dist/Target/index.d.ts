export interface targetUser {
    name: string;
    lastLogin: number;
    lastUpdate: number;
    loggedIn: boolean;
}
export interface targetApp {
    name: string;
    running: boolean;
    version: string;
}
export interface targetInterface {
    ip: string;
    mac: string;
    state: "down" | "up";
}
export interface targetRequest {
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
}
export interface target {
    id: string;
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
    lastPing: number;
    dateAdded: number;
}
//# sourceMappingURL=index.d.ts.map