import React, { useState } from "react";
import { target } from "../Dashboard";
import { useTargetStream } from "../../hooks/TargetsProvicer";
import { convertISOToHumanReadable } from "../../utils/time";
import Target from "../Target/Target";

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
        <div className="p-7 flex">
            <div className="stats-container flex flex-wrap gap-4 flex-1 p-4 bg-base-200">
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
                        <div className="stat-title">IPS</div>
                        <div className="stat-value">
                            {info.ips.map((ip) => (
                                <div>{ip}</div>
                            ))}
                        </div>
                        <div className="stat-desc">ip addresses in use</div>
                    </div>
                </div>
                {lastUpdatedTarget && <Target target={lastUpdatedTarget} />}
            </div>
        </div>
    );
}

export default Home;
