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
        await beacon.addUserEvent(userToTarget.name);
        await beacon.interfaceCreatedEvent(interfaceToTarget);
        await beacon.processCreatedEvent(appInfo);
        await beacon.init();
        await beacon.startListening()
    }, 30000);
    let userToAddAndDelete = faker.internet.userName();
    it("should add a user", async function () {
        const response = await beacon.addUserEvent(userToAddAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should delete a user", async function () {
        const response = await beacon.delUserEvent(userToAddAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log on a user", async function () {
        const response = await beacon.loginUserEvent(userToTarget, true);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log off a user", async function () {
        const response = await beacon.loginUserEvent(userToTarget, false);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should change user group", async function () {
        const response = await beacon.groupChangeEvent(userToTarget.name, faker.word.sample());
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file accessed", async function () {
        const response = await beacon.fileAccessedEvent(faker.system.fileName(), {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file created", async function () {
        const response = await beacon.fileCreatedEvent(appToTarget.name, {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file deleted", async function () {
        const response = await beacon.fileDeletedEvent(appToTarget.name, {
            username: faker.internet.userName(),
            permissions: faker.word.sample(),
            path: faker.system.filePath(),
        });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log file permissions change", async function () {
        const response = await beacon.filePermissionsChangeEvent(appToTarget.name, {
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
        const response = await beacon.interfaceCreatedEvent(interfaceToCreateAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });
    it("should log interface up", async function () {
        const response = await beacon.interfaceUpEvent(interfaceToTarget);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface down", async function () {
        const response = await beacon.interfaceDownEvent(interfaceToTarget);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface deleted", async function () {
        const response = await beacon.interfaceDeletedEvent(interfaceToCreateAndDelete);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log interface IP change", async function () {
        interfaceToTarget.ip4 = faker.internet.ipv4();
        const response = await beacon.interfaceIpChangeEvent(interfaceToTarget, "4");
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process created", async function () {
        const response = await beacon.processCreatedEvent(appInfo);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log process ended", async function () {
        const response = await beacon.processEndedEvent(appInfo);
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log registry edit", async function () {
        const response = await beacon.regEditEvent(faker.word.sample(), faker.word.sample(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log kernel event", async function () {
        const response = await beacon.kernelEvent(faker.system.fileName(), faker.system.filePath(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    it("should log config event", async function () {
        const response = await beacon.configEvent(faker.system.fileName(), faker.system.filePath(), { username: faker.internet.userName() });
        if (!response) return expect(response).toBe({ status: "success" });
        expect(response.status).toBe("success");
    });

    afterAll(async () => {
        // const response = await beacon.delete();
        // console.log(response);
        await beacon.stopListening()
    });
});
