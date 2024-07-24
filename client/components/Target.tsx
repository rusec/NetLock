import React from "react";
import { target } from "./Dashboard";
import { convertISOToHumanReadable } from "../utils/time";

type Props = {
    target: target;
};

export default function Target({ target }: Props) {
    return (
        <div key={target.id} className="target-card">
            <div className="target-inner">
                <div className="target-front">
                    <h2>
                        {target.hostname} ({target.os})
                    </h2>

                    <h3>Interfaces</h3>
                    {target.interfaces.map((intf, index) => (
                        <p key={index}>
                            IP: {intf.ip}, MAC: {intf.mac}, State: {intf.state}
                        </p>
                    ))}
                    <h3>Users</h3>
                    {target.users.map((user, index) => (
                        <p key={index}>
                            Name: {user.name}, Last Login: {user.lastLogin}, Last Update: {user.lastUpdate}, Logged In: {user.loggedIn ? "Yes" : "No"}
                        </p>
                    ))}
                    <h3>Apps</h3>
                    {target.apps.map((app, index) => (
                        <p key={index}>
                            Name: {app.name}, Running: {app.running ? "Yes" : "No"}, Version: {app.version}
                        </p>
                    ))}
                </div>
                <div className="target-back">
                    <p>Last Ping: {convertISOToHumanReadable(target.lastPing)}</p>
                    <p>Date Added: {convertISOToHumanReadable(target.dateAdded)}</p>
                </div>
            </div>
        </div>
    );
}
