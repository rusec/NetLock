import React, { Dispatch, SetStateAction } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import { Page } from "../Dashboard";

type Props = {
    Page: Page;
    SetPage: Dispatch<SetStateAction<Page>>;
};

export default function Nav({ Page, SetPage }: Props) {
    const auth = useAuth();

    return (
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <a className="btn btn-ghost text-xl">Dashboard</a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <a onClick={() => SetPage("Home")}>Home</a>
                    </li>
                    <li>
                        <a onClick={() => SetPage("Targets")}>Targets</a>
                    </li>
                    <li>
                        <a onClick={() => SetPage("Logs")}>Logs</a>
                    </li>
                </ul>
            </div>
            <div className="navbar-end gap-3">
                <label className="flex cursor-pointer gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                    <input type="checkbox" value="synthwave" className="toggle theme-controller" />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </label>
                <a
                    className="btn bg-primary
"
                    onClick={() => {}}
                >
                    Reset Password
                </a>
                <a className="btn  bg-secondary" onClick={auth.logOut}>
                    Logout
                </a>
            </div>
        </div>
    );
}
