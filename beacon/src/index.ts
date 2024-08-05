import { Beacon } from "netlocklib/dist/Beacon";
import fs from "fs";
import os from "os";
import { log } from "./output/debug";
import { target } from "netlocklib/dist/Target";
import system from "systeminformation";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
    args: process.argv,
    options: {
        server: {
            type: "string",
        },
        key: {
            type: "string",
        },
    },
});
async function run() {
    if (!values.server) {
        log("Please enter a server url before launching");
        process.exit(1);
    }
    if (!values.key) {
        log("Please enter the beacon key for the server");
        process.exit(1);
    }
    log("Starting beacon", "info");

    log("Gathering Info...", "info");

    let hostname = os.hostname();
    let platform = os.platform();
    let networkInterfaces = await Beacon.getNetworkInterfaces();
    let users = await Beacon.getUsers();
    let apps = await Beacon.getProcesses();
    let b = new Beacon(values.server);
    await b.requestToken(values.key);
}
run();
