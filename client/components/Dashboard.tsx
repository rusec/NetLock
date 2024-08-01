import React, { useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import Home from "./pages/Home";
import { TargetStreamProvider } from "../hooks/TargetsProvider";
import Targets from "./pages/Targets";
import Nav from "./Nav/Nav";
import Alert, { alert } from "./models/Alert";
import { LogStreamProvider } from "../hooks/LogsProvider";
import Logs from "./pages/Logs";

export type Page = "Home" | "Targets" | "Logs";

function Dashboard() {
    const [Page, setPage] = useState<Page>((localStorage.getItem("Page") || "Home") as Page);
    const [AlertMessage, setAlertMessage] = useState<alert | false>(false);
    return (
        <div className="relative">
            {AlertMessage && <Alert Alert={AlertMessage} setAlert={setAlertMessage} />}
            <Nav
                Page={Page}
                SetPage={(value) => {
                    localStorage.setItem("Page", value.toString());
                    setPage(value);
                }}
            />
            <div>
                <TargetStreamProvider>
                    <LogStreamProvider setAlert={setAlertMessage}>
                        {Page === "Home" && <Home />}
                        {Page === "Targets" && <Targets />}
                        {Page === "Logs" && <Logs />}
                    </LogStreamProvider>
                </TargetStreamProvider>
            </div>
            <footer className="footer footer-center bg-base-300 text-base-content p-4">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved by RUSEC</p>
                </aside>
            </footer>
        </div>
    );
}

export default Dashboard;
