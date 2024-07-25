import React from "react";
import { useTargetStream } from "../../hooks/TargetsProvicer";
import Target from "../Target";
import { convertISOToHumanReadable } from "../../utils/time";

type Props = {};

function Targets({}: Props) {
    const { targets, lastUpdatedID } = useTargetStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastUpdatedID) || false;
    return (
        <div className="dash-page">
            <div className="target-container">
                {targets &&
                    targets.map((target) => (
                        <div className="card">
                            <div className="card-content">
                                <div className="card-title"></div>
                                <div className="card-value">
                                    <div>
                                        <div className="target-front">
                                            <h2>
                                                {target.hostname} ({target.os})
                                            </h2>

                                            <h3>Interfaces</h3>
                                            <div className="interface-container">
                                                {target.interfaces.map((intf, index) => (
                                                    <div key={index} className="interface-info">
                                                        <span className="interface-ip">IP: {intf.ip}</span>
                                                        <span className="interface-mac">MAC: {intf.mac}</span>
                                                        <span className="interface-state">State: {intf.state}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h3>Users</h3>
                                            <div className="user-container">
                                                {target.users.map((user, index) => (
                                                    <div key={index} className="user-info">
                                                        <span className="user-name">Name: {user.name}</span>
                                                        <span className="user-last-login">Last Login: {user.lastLogin}</span>
                                                        <span className="user-last-update">Last Update: {user.lastUpdate}</span>
                                                        <span className="user-logged-in">Logged In: {user.loggedIn ? "Yes" : "No"}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h3>Apps</h3>
                                            <div className="app-container">
                                                {target.apps.map((app, index) => (
                                                    <div key={index} className="app-info">
                                                        <span className="app-name">Name: {app.name}</span>
                                                        <span className="app-running">Running: {app.running ? "Yes" : "No"}</span>
                                                        <span className="app-version">Version: {app.version}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="target-back">
                                            <p>Last Ping: {convertISOToHumanReadable(target.lastPing)}</p>
                                            <p>Date Added: {convertISOToHumanReadable(target.dateAdded)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Targets;
