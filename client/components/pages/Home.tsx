import React, { useState } from "react";
import { target } from "netlocklib/dist/Target";
import { useStream } from "../../hooks/StreamProvider";
import Target from "../Target/Target";
import { Beacon } from "netlocklib/dist/Beacon";

type Props = {
    // targets: target[];
    // lastUpdatedID: string;
};

interface HomeInfo {
    targets: number;
    users: number;
    apps: number;
    ips: { value: string; state: "up" | "down" }[];

    lastUpdated: Beacon.Data | false;
}

function Home({}: Props) {
    const { targets, lastTargetUpdatedID } = useStream();
    const lastUpdatedTarget = targets.find((v) => v.id == lastTargetUpdatedID) || false;

    function parseHomeInfo() {
        let lastUpdatedTarget = targets.find((v) => v.id == lastTargetUpdatedID) || false;
        let numberOfTargets = targets.length;
        let numberOfUsers = targets.reduce((p, v) => p + v.users.length, 0);
        let numberOfApps = targets.reduce((p, v) => p + v.apps.length, 0);

        let ips = targets.flatMap((v) =>
            v.networkInterfaces.map((i) => {
                return { value: i.ip4 + " " + i.mac, state: i.state };
            })
        );
        let result: HomeInfo = {
            targets: numberOfTargets,
            users: numberOfUsers,
            apps: numberOfApps,
            ips: ips,
            lastUpdated: lastUpdatedTarget,
        };
        return result;
    }

    const info = parseHomeInfo();
    return (
        <div className="px-7 pr-7 pb-7">
            <div className="bg-base-200 shadow">
                <div className="flex">
                    <div className="stats-container flex flex-wrap gap-4 justify-center flex-1 p-4 ">
                        <div className="stats shadow flex-1">
                            <div className="stat">
                                <div className="stat-title">Targets</div>
                                <div className="stat-value">{info.targets}</div>
                                <div className="stat-desc">amount of targets</div>
                            </div>
                        </div>
                        <div className="stats shadow flex-1">
                            <div className="stat">
                                <div className="stat-title">Users</div>
                                <div className="stat-value">{info.users}</div>
                                <div className="stat-desc">amount of users</div>
                            </div>
                        </div>
                        <div className="stats shadow flex-1">
                            <div className="stat">
                                <div className="stat-title">Apps</div>
                                <div className="stat-value">{info.apps}</div>
                                <div className="stat-desc">amount of apps</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <div className="stats-container flex flex-wrap gap-4 flex-1 p-4 ">
                        <div className="stats shadow flex-1">
                            <div className="stat relative">
                                <div className="stat-title">Last Updated</div>
                                {lastUpdatedTarget && <Target fillContainer={true} target={lastUpdatedTarget} />}
                                <div className="stat-desc">Last updated target</div>
                            </div>
                        </div>

                        <div className="stats shadow flex-1">
                            <div className="stat">
                                <div className="stat-title">IPS</div>
                                <div className="stat-value">
                                    <div className="font-light overflow-y-auto flex flex-wrap gap-4 text-lg">
                                        {info.ips.map((ip) => (
                                            <span
                                                key={ip.value}
                                                className={`px-2 py-1 rounded ${
                                                    ip.state == "up" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
                                                }`}
                                                title={ip.state}
                                            >
                                                {ip.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="stat-desc">ip addresses in use</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
