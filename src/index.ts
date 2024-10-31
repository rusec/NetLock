import express, { Request, Response, NextFunction } from "express";
import path from "path";
import https from "https";
import fs from "fs";
import readline from "readline";
import helmet from "helmet";
import morgan from "morgan";
// import { UserRouter } from "./routes/user/user";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import crypto from "crypto";
// import { BeaconRouter } from "./routes/beacon/beacon";
import args from "args";
import { log } from "./utils/output/debug";
import compression from "compression";
import { version, description } from "../package.json";
import { configureFolderRouter } from "express-folder-router";
import createRouter, { router } from "express-file-routing";

args.option("passphrase", "passphrase for ssl cert");
const flags = args.parse(process.argv);

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
        scriptSrc: [
          "'self'",
          (req, res: any) => `'nonce-${res.locals.cspNonce}'`,
          "unsafe-eval",
        ],
      },
    },
  })
);
//Middleware for hosting the frontend
app.use(express.static(path.join(__dirname, "../../public")));

//Middleware for logging
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

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
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "NetLock",
      version: version,
      description: description,
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "RUSEC",
        url: "https://logrocket.com",
        email: "rusec@rusec.club",
      },
    },
    servers: [
      {
        url: "https://localhost",
      },
    ],
    securityDefinitions: {
      bearerAuth: {
        type: "http",
        name: "Authorization",
        scheme: "bearer",
        bearerFormat: "JWT",
        in: "header",
      },
    },
  },
  apis: ["./dist/src/routes/**/*.js"],
};

const specs = swaggerJSDoc(options);
if (process.env.DEVELOPMENT) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}

createRouter(app, {
  directory: path.resolve("./dist/src/routes"),
}).then((app) => {
  // Exit system if no ssl cert is detected
  if (!fs.existsSync("cert.pem") || !fs.existsSync("key.pem")) {
    throw new Error(
      "Please Create a cert using\nopenssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365\n Thank you"
    );
  }

  // Endpoint to ensure react router works properly
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/index.html"));
  });

  const optionsSSL = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
    passphrase: flags.passphrase,
  };
  // host the application using SSL
  https.createServer(optionsSSL, app).listen(443, () => {
    console.log(`App listening on port ${443}`);
  });
});

// // Beacon endpoint
// app.use("/api/beacon", BeaconRouter);

// // User Endpoint
// app.use("/api/user", UserRouter);
