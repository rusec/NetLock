import express, { NextFunction, Response, Router } from "express";
import { AuthenticatedRequest, beaconToken } from "../../utils/types/token";
import crypto from "crypto";
import { log } from "../../utils/output/debug";
let router = Router({
    caseSensitive: true,
});
