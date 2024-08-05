import { Beacon } from "netlocklib/dist/Beacon";

if (!process.send) {
    process.exit(1);
}
setInterval(async () => {
    if (!process.send) {
        process.exit(1);
    }
    let processes = await Beacon.getProcesses();
    process.send(processes);
}, 1000);
