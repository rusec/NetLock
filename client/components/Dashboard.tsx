import React, { useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import Home from "./pages/Home";
import { StreamProvider } from "../hooks/StreamProvider";
import Targets from "./pages/Targets";
import Nav from "./Nav/Nav";
import Alert, { alert } from "./models/Alert";
import Logs from "./pages/Logs";
import Target from "./Target/Target";
import TargetPage from "./pages/TargetPage";
import { useNavigate, useSearchParams } from "react-router-dom";

export type Page = "Home" | "Targets" | "Logs" | "Target";

function Dashboard() {
    const [Page, setPage] = useState<Page>((localStorage.getItem("Page") || "Home") as Page);
    const [AlertMessage, setAlertMessage] = useState<alert | false>(false);
    const [Loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams();
    const id = searchParams.get("id");

    return (
        <div className="relative">
            {AlertMessage && <Alert Alert={AlertMessage} setAlert={setAlertMessage} />}
            <Nav
                Page={Page}
                SetPage={(value) => {
                    localStorage.setItem("Page", value.toString());
                    setPage(value);
                    navigate("/dashboard");
                }}
            />
            <div>
                <StreamProvider setAlert={setAlertMessage} setLoading={setLoading}>
                    {Page === "Home" && !id && <Home />}
                    {Page === "Targets" && !id && <Targets />}
                    {Page === "Logs" && !id && <Logs />}
                    {id && <TargetPage />}
                </StreamProvider>
                {Loading && (
                    <div className="flex justify-center p-5">
                        <span className="loading loading-bars loading-lg"></span>
                    </div>
                )}
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
