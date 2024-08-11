import React, { useEffect, useState, useMemo } from "react";
import { useStream } from "../../hooks/StreamProvider";
import { convertDateToHumanReadable } from "../../utils/time";

type Props = {};

const Logs: React.FC<Props> = () => {
    const { logs, allEventTypes, getTargetsByIdAndName, getTargetNameByID } = useStream();
    const [targetSelected, setTargetSelected] = useState<string>("");
    const [eventSelected, setEventSelected] = useState<string>("");
    const [dateOrder, setDateOrder] = useState<"Up" | "Down">("Up");
    const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);

    const displayedLogs = useMemo(() => {
        let filteredLogs = logs;

        if (targetSelected) {
            filteredLogs = filteredLogs.filter((log) => log.targetId === targetSelected);
        }

        if (eventSelected) {
            filteredLogs = filteredLogs.filter((log) => log.event === eventSelected);
        }

        filteredLogs.sort((a, b) => (dateOrder === "Up" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp));
        return filteredLogs;
    }, [logs, targetSelected, eventSelected, dateOrder]);

    const parseStats = () => {
        const amountOfUrgent = logs.reduce((prev, v) => (v.urgent ? prev + 1 : prev), 0);
        return { amountOfUrgent };
    };
    const info = parseStats();

    const handleRowClick = (index: number | null) => {
        setSelectedLogIndex(selectedLogIndex === index ? null : index);
    };

    return (
        <div className="pr-7 px-7 pb-7">
            <div className="p-2 bg-base-300 flex">
                <div className="p-2 w-4/5">
                    <div className="flex relative">
                        <div className="card-title">Logs</div>
                        <div className="ml-auto">
                            <button onClick={() => setDateOrder(dateOrder === "Up" ? "Down" : "Up")} className="btn m-1">
                                {dateOrder === "Up" ? "Recent" : "Old"}
                            </button>
                            <div className="dropdown dropdown-end">
                                <button tabIndex={0} className="btn m-1">
                                    Filter Event
                                </button>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow">
                                    <li>
                                        <a onClick={() => setEventSelected("")}>All</a>
                                    </li>
                                    {allEventTypes.map((eventType) => (
                                        <li key={eventType}>
                                            <a onClick={() => setEventSelected(eventType)}>{eventType}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="dropdown dropdown-end">
                                <button tabIndex={0} className="btn m-1">
                                    Filter Target
                                </button>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow">
                                    <li>
                                        <a onClick={() => setTargetSelected("")}>All</a>
                                    </li>
                                    {getTargetsByIdAndName().map((target) => (
                                        <li key={target.id}>
                                            <a onClick={() => setTargetSelected(target.id)}>{target.name}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[70vh]">
                        <table className="table w-full table-pin-rows">
                            <thead>
                                <tr className="bg-base-200 text-white">
                                    <th></th>
                                    <th>Date</th>
                                    <th>Event</th>
                                    <th>Target</th>
                                    <th>Message</th>
                                    <th>Urgent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedLogs.map((log, index) => (
                                    <React.Fragment key={index}>
                                        <tr className="hover:bg-neutral hover:text-white cursor-pointer" onClick={() => handleRowClick(index)}>
                                            <th>{index + 1}</th>
                                            <td>{convertDateToHumanReadable(log.timestamp)}</td>
                                            <td>{log.event.toUpperCase()}</td>
                                            <td>{getTargetNameByID(log.targetId)}</td>
                                            <td>{log.message}</td>
                                            <td>{log.urgent ? "Yes" : "No"}</td>
                                        </tr>
                                        {selectedLogIndex === index && (
                                            <tr className="bg-base-100">
                                                <td colSpan={6}>
                                                    <pre className="whitespace-pre-wrap p-4">{JSON.stringify(log, null, 2)}</pre>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4">
                    <div className="stats-container flex flex-wrap gap-4 justify-center p-4">
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Logs</div>
                                <div className="stat-value">{logs.length}</div>
                                <div className="stat-desc">amount of Logs</div>
                            </div>
                        </div>
                        <div className="stats shadow">
                            <div className="stat">
                                <div className="stat-title">Urgent</div>
                                <div className="stat-value">{info.amountOfUrgent}</div>
                                <div className="stat-desc">amount of urgent logs</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logs;
