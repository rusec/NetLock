import { Beacon, TestBeacon } from "netlocklib/dist/Beacon";
import { faker, ne } from "@faker-js/faker";
import { API } from "netlocklib/dist/api";
import os from "os";
describe("Beacon Class", function () {
    let beacon: Beacon;
    let interfaceToTarget: Beacon.networkInterface = {
        mac: faker.internet.mac(),
        state: "up",
        iface: "BOBs",
        ifaceName: "BOB",
        default: false,
        ip4: faker.internet.ipv4(),
        ip4subnet: faker.internet.ipv4(),
        ip6: faker.internet.ipv6(),
        ip6subnet: faker.internet.ipv6(),
    };
    let userToTarget: Beacon.userLogin = {
        name: faker.person.fullName(),
        date: 0,
    };
    let appInfo: Beacon.applicationSpawn = {
        name: faker.commerce.product(),
        pid: faker.number.int({ min: 1000, max: 9999 }),
        state: "",
        tty: "",
        user: "",
        command: "",
        params: "",
        path: "",
        started: "",
    };
    let appToTarget = { name: appInfo.name, running: true, version: faker.system.semver(), pids: [], instances: 0 };
    beforeAll(async () => {
        beacon = new TestBeacon("Testing Beacon: " + faker.person.fullName(), "https://localhost");
        await beacon.requestToken("MindoverMatter");
        await beacon.addUser(userToTarget.name);
        await beacon.interfaceCreated(interfaceToTarget);
        await beacon.processCreated(appInfo);
        let ifaces = await Beacon.getNetworkInterfaces();
        let users = (await Beacon.getUsers()).map((u) => {
            let user: Beacon.user = {
                lastUpdate: new Date().getTime(),
                loggedIn: true,
                logins: [{ ...u, name: u.user, date: new Date(u.date).getTime() }],
                name: u.user,
            };
            return user;
        });
        let apps = (await Beacon.getProcesses()).map((a) => {
            let app: Beacon.application = {
                name: a.name,
                running: true,
                spawns: [a],
            };
            return app;
        });
        let services = await Beacon.getNetworkListening();
        let networkInterfaces: Beacon.networkInterface[];
        if (!Array.isArray(ifaces)) {
            networkInterfaces = [{ ...ifaces, state: ifaces.operstate === "up" ? "up" : "down" }];
        } else {
            networkInterfaces = ifaces.map((i) => {
                return { ...i, state: i.operstate === "up" ? "up" : "down" };
            });
        }
        await beacon.sendInit(users, networkInterfaces, apps, services);
    }, 20000);
    let userToAddAndDelete = faker.internet.userName();
    it("should add a user", async function () {
        const response = await beacon.addUser(userToAddAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should delete a user", async function () {
        const response = await beacon.delUser(userToAddAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log on a user", async function () {
        const response = await beacon.loginUser(userToTarget, true);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log off a user", async function () {
        const response = await beacon.loginUser(userToTarget, false);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should change user group", async function () {
        const response = await beacon.groupChange(userToTarget.name, faker.word.sample());
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file accessed", async function () {
        const response = await beacon.fileAccessed(faker.system.fileName(), {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file created", async function () {
        const response = await beacon.fileCreated(appToTarget.name, {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file deleted", async function () {
        const response = await beacon.fileDeleted(appToTarget.name, {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file permissions change", async function () {
        const response = await beacon.filePermissionsChange(appToTarget.name, {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    let interfaceToCreateAndDelete: Beacon.networkInterface = {
        mac: faker.internet.mac(),
        state: "up",
        iface: "BOB",
        ifaceName: "BOB",
        default: false,
        ip4: faker.internet.ipv4(),
        ip4subnet: faker.internet.ipv4(),
        ip6: faker.internet.ipv6(),
        ip6subnet: faker.internet.ipv6(),
    };
    it("should log interface created", async function () {
        const response = await beacon.interfaceCreated(interfaceToCreateAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log interface up", async function () {
        const response = await beacon.interfaceUp(interfaceToTarget);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface down", async function () {
        const response = await beacon.interfaceDown(interfaceToTarget);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface deleted", async function () {
        const response = await beacon.interfaceDeleted(interfaceToCreateAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface IP change", async function () {
        interfaceToTarget.ip4 = faker.internet.ipv4();
        const response = await beacon.interfaceIpChange(interfaceToTarget, "4");
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process created", async function () {
        const response = await beacon.processCreated(appInfo);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process ended", async function () {
        const response = await beacon.processEnded(appInfo);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log registry edit", async function () {
        const response = await beacon.regEdit(faker.word.sample(), faker.word.sample(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log kernel event", async function () {
        const response = await beacon.kernel(faker.system.fileName(), faker.system.filePath(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log config event", async function () {
        const response = await beacon.config(faker.system.fileName(), faker.system.filePath(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    afterAll(async () => {
        const response = await beacon.delete();
        console.log(response);
    });
});
