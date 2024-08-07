import express, { Request, Response, NextFunction } from "express";
import path from "path";
import https from "https";
import fs from "fs";
import readline from "readline";
import helmet from "helmet";
import morgan from "morgan";
import { UserRouter } from "./routes/user/user";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import crypto from "crypto";
import { BeaconRouter } from "./routes/target/target";
import args from "args";
import { log } from "./utils/output/debug";
import compression from "compression";
args.option("passphrase", "passphrase for ssl cert");
const flags = args.parse(process.argv);

if (!flags.passphrase) {
    log("No passphrase", "error");
    process.exit(1);
}

const app = express();
// initializes Nonce for CSP
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
    next();
});
/**
 * Middleware for compression for limiting response size
 */
app.use(compression());

/**
 * Middleware for removing unnecessary headers
 */
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                scriptSrc: ["'self'", (req, res: any) => `'nonce-${res.locals.cspNonce}'`, "unsafe-eval"],
            },
        },
    })
);

//Middleware for logging
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));

//Middleware for hosting the frontend
app.use(express.static(path.join(__dirname, "../public")));

/**
 * Middleware for JSON
 * Limit size set to 50mb because of big data transfers
 */
app.use(
    express.json({
        limit: 52428800,
    })
);

/**
 * Initializing swagger docs
 */
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "NetLock",
            version: "0.1.0",
            description: "Locking the network one beacon at a time",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "RUSEC",
                url: "https://logrocket.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "https://localhost",
            },
        ],
        securityDefinitions: {
            bearerAuth: {
                type: "apiKey",
                name: "Authorization",
                scheme: "bearer",
                in: "header",
            },
        },
    },
    apis: ["./dist/routes/**/*.js"],
};

const specs = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//Useless function should delete
app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send("Hello World");
    } catch (error) {
        next(error);
    }
});

// Beacon endpoint
app.use("/api/beacon", BeaconRouter);

// User Endpoint
app.use("/api/user", UserRouter);

// Endpoint to ensure react router works properly
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Exit system if no ssl cert is detected
if (!fs.existsSync("cert.pem") || !fs.existsSync("key.pem")) {
    throw new Error("Please Create a cert using\nopenssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365\n Thank you");
}

const optionsSSL = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
    passphrase: flags.passphrase,
};
// host the application using SSL
https.createServer(optionsSSL, app).listen(443, () => {
    console.log(`App listening on port ${443}`);
});
