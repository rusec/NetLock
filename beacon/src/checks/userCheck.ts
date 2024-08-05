import { Beacon } from "netlocklib/dist/Beacon";

if (!process.send) {
    process.exit(1);
}
setInterval(async () => {
    if (!process.send) {
        process.exit(1);
    }
    let users = await Beacon.getUsers();
    process.send(users);
}, 1000);
