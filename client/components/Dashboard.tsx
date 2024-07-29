import React, { useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import Home from "./pages/Home";
import { TargetStreamProvider } from "../hooks/TargetsProvicer";
import Targets from "./pages/Targets";
import Nav from "./Nav/Nav";

interface targetUser {
    name: string;
    lastLogin: number;
    lastUpdate: number;
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
    lastPing: number;
    dateAdded: number;
}
export type Page = "Home" | "Targets" | "Logs";

function Dashboard() {
    const auth = useAuth();

    const [Page, setPage] = useState<Page>("Home");
    return (
        <div>
            <Nav Page={Page} SetPage={setPage} />
            <div className="dash-page">
                <TargetStreamProvider>
                    {Page === "Home" && <Home />}
                    {Page === "Targets" && <Targets />}
                </TargetStreamProvider>
            </div>
        </div>
    );
}

export default Dashboard;
