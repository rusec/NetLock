import { Beacon } from "netlocklib/dist/Beacon";
import { faker } from "@faker-js/faker";
import { targetApp, targetInterface, targetUser } from "netlocklib/dist/Target";
import { API } from "netlocklib/dist/api";
describe("Beacon Class", function () {
    let beacon: Beacon;
    let interfaceToTarget: targetInterface = {
        mac: faker.internet.mac(),
        ip: faker.internet.ip(),
        state: "up",
    };
    let userToTarget: targetUser = {
        name: faker.person.fullName(),
        lastUpdate: new Date().getTime(),
        loggedIn: true,
        lastLogin: new Date().getTime(),
    };
    let appToTarget: targetApp = { name: faker.commerce.product(), running: true, version: faker.system.semver() };
    beforeAll(async () => {
        beacon = new Beacon(faker.person.firstName(), faker.system.semver(), "https://localhost", {
            interfaces: [
                {
                    mac: faker.internet.mac(),
                    ip: faker.internet.ip(),
                    state: "up",
                },
                {
                    mac: faker.internet.mac(),
                    ip: faker.internet.ip(),
                    state: "up",
                },
                {
                    mac: faker.internet.mac(),
                    ip: faker.internet.ip(),
                    state: "up",
                },
                interfaceToTarget,
            ],
            users: [
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                { name: faker.person.fullName(), lastUpdate: new Date().getTime(), loggedIn: true, lastLogin: new Date().getTime() },
                userToTarget,
            ],
            apps: [
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                { name: faker.commerce.product(), running: true, version: faker.system.semver() },
                appToTarget,
            ],
        });
        await beacon.requestToken("MindoverMatter");
    });
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
        const response = await beacon.logUser(userToTarget.name, true);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log off a user", async function () {
        const response = await beacon.logUser(userToTarget.name, false);
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

    let interfaceToCreateAndDelete: targetInterface = {
        mac: faker.internet.mac(),
        ip: faker.internet.ip(),
        state: "up",
    };
    it("should log interface created", async function () {
        const response = await beacon.interfaceCreated(interfaceToCreateAndDelete.mac, interfaceToCreateAndDelete.ip, "up", {
            username: faker.internet.userName(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log interface up", async function () {
        const response = await beacon.interfaceUp(interfaceToTarget.mac, interfaceToTarget.ip, { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface down", async function () {
        const response = await beacon.interfaceDown(interfaceToTarget.mac, interfaceToTarget.ip, { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface deleted", async function () {
        const response = await beacon.interfaceDeleted(interfaceToCreateAndDelete.mac, { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface IP change", async function () {
        const response = await beacon.interfaceIpChange(interfaceToTarget.mac, faker.internet.ip(), "up", { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process created", async function () {
        const response = await beacon.processCreated(appToTarget.name, faker.string.alphanumeric(5), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process ended", async function () {
        const response = await beacon.processEnded(appToTarget.name, faker.string.alphanumeric(5), { username: faker.internet.userName() });
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
