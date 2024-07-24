import React, { useState } from "react";
import { target } from "../Dashboard";
import { useTargetStream } from "../../hooks/TargetsProvicer";
import { convertISOToHumanReadable } from "../../utils/time";

type Props = {
    // targets: target[];
    // lastUpdatedID: string;
};

interface HomeInfo {
    targets: number;
    users: number;
    ips: string[];

    lastUpdated: target | false;
}

function Home({}: Props) {
    const { targets, lastUpdatedID } = useTargetStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastUpdatedID) || false;

    function parseHomeInfo() {
        let lastUpdatedTarget = targets.find((v) => v.id == lastUpdatedID) || false;
        let numberOfTargets = targets.length;
        let numberOfUsers = targets.reduce((p, v) => p + v.users.length, 0);
        let ips = targets.flatMap((v) => v.interfaces.map((i) => i.ip + " " + i.mac));
        let result: HomeInfo = {
            targets: numberOfTargets,
            users: numberOfUsers,
            ips: ips,
            lastUpdated: lastUpdatedTarget,
        };
        return result;
    }

    const info = parseHomeInfo();

    return (
        <div className="dash-page">
            <div className="home-container">
                <div className="card">
                    <div className="card-content">
                        <div className="card-title">Targets</div>
                        <div className="card-value-number">{info.targets}</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-content">
                        <div className="card-title">Users</div>
                        <div className="card-value-number">{info.users}</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-content">
                        <div className="card-title">IPS in use</div>
                        <div className="card-value">
                            {info.ips.map((ip) => (
                                <div>{ip}</div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-content">
                        <div className="card-title">Last Updated</div>
                        <div className="card-value">
                            {lastUpdatedTarget && (
                                <div>
                                    <div className="target-front">
                                        <h2>
                                            {lastUpdatedTarget.hostname} ({lastUpdatedTarget.os})
                                        </h2>

                                        <h3>Interfaces</h3>
                                        {lastUpdatedTarget.interfaces.map((intf, index) => (
                                            <p key={index}>
                                                IP: {intf.ip}, MAC: {intf.mac}, State: {intf.state}
                                            </p>
                                        ))}
                                        <h3>Users</h3>
                                        {lastUpdatedTarget.users.map((user, index) => (
                                            <p key={index}>
                                                Name: {user.name}, Last Login: {user.lastLogin}, Last Update: {user.lastUpdate}, Logged In:{" "}
                                                {user.loggedIn ? "Yes" : "No"}
                                            </p>
                                        ))}
                                        <h3>Apps</h3>
                                        {lastUpdatedTarget.apps.map((app, index) => (
                                            <p key={index}>
                                                Name: {app.name}, Running: {app.running ? "Yes" : "No"}, Version: {app.version}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="target-back">
                                        <p>Last Ping: {convertISOToHumanReadable(lastUpdatedTarget.lastPing)}</p>
                                        <p>Date Added: {convertISOToHumanReadable(lastUpdatedTarget.dateAdded)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
