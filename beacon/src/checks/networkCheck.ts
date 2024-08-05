import { Beacon } from "netlocklib/dist/Beacon";

if (!process.send) {
    process.exit(1);
}
setInterval(async () => {
    if (!process.send) {
        process.exit(1);
    }
    let network = await Beacon.getNetworkInterfaces();
    process.send(network);
}, 1000);
