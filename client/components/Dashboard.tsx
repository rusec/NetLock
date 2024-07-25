import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import { convertISOToHumanReadable } from "../utils/time";
import Target from "./Target";
import Home from "./pages/Home";
import { TargetStreamProvider } from "../hooks/TargetsProvicer";
import Targets from "./pages/Targets";
interface targetUser {
    name: string;
    lastLogin: string;
    lastUpdate: string;
    loggedIn: boolean;
}
interface targetApp {
    name: string;
    running: boolean;
    version: string;
}
interface targetInterface {
    ip: string;
    mac: string;
    state: "down" | "up";
}
export interface target {
    id: string;
    hostname: string;
    os: string;
    active: boolean;
    interfaces: Array<targetInterface>;
    users: Array<targetUser>;
    apps: Array<targetApp>;
    lastPing: string;
    dateAdded: string;
}
export type Page = "Home" | "Targets" | "Logs";

function Dashboard() {
    const auth = useAuth();

    const [Page, setPage] = useState<Page>("Home");

    return (
        <div className="dashboard">
            <div className="dash-header">
                <h1>Dashboard</h1>
                <div className="dash-header-nav-button">
                    <button className="dash-button" onClick={() => {}}>
                        resetPassword
                    </button>
                    <button className="dash-button logout" onClick={auth.logOut}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="dash-body">
                <div className="dash-pages-container">
                    <div className="dash-page-tab" onClick={() => setPage("Home")}>
                        Home
                    </div>
                    <div className="dash-page-tab" onClick={() => setPage("Targets")}>
                        Targets
                    </div>
                    <div className="dash-page-tab" onClick={() => setPage("Logs")}>
                        Logs
                    </div>
                </div>
                <div className="dash-page">
                    <TargetStreamProvider>
                        {Page === "Home" && <Home />}
                        {Page === "Targets" && <Targets />}
                    </TargetStreamProvider>
                </div>
            </div>

            {/* <button onClick={auth.resetPassword}>Reset Password</button> */}
        </div>
    );
}

export default Dashboard;
