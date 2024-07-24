import express, { Request, Response, NextFunction } from "express";
import path from "path";
import https from "https";
import fs from "fs";
import readline from "readline";
import helmet from "helmet";
import morgan from "morgan";
import { UserRouter } from "./routes/user/user";
import { BeaconRegisterRouter } from "./routes/register/register";
const app = express();
// app.use(helmet());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send("Hello World");
    } catch (error) {
        next(error);
    }
});
app.use("/api/beacon", BeaconRegisterRouter);
app.use("/api/user", UserRouter);
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});
if (!fs.existsSync("cert.pem")) {
    throw new Error("Please Create a cert using\nopenssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365\n Thank you");
}

let rl = readline.createInterface(process.stdin, process.stdout);

// THIS IS FOR PROD
// rl.question("Please Enter SSL passphrase: ", (i) => {
//     const options = {
//         key: fs.readFileSync("key.pem"),
//         cert: fs.readFileSync("cert.pem"),
//         passphrase: i,
//     };
//     https.createServer(options, app).listen(443, () => {
//         console.log(`App listening on port ${443}`);
//     });
// });
const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
    passphrase: "pine",
};
https.createServer(options, app).listen(443, () => {
    console.log(`App listening on port ${443}`);
});
