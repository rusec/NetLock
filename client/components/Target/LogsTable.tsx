import { LogEvent } from "netlocklib/dist/Events";
import React, { useEffect, useState, useMemo } from "react";
import { convertDateToHumanReadable } from "../../utils/time";
import { useStream } from "../../hooks/StreamProvider";

type Props = {
    targetId: string;
};

const LogsTable: React.FC<Props> = ({ targetId }) => {
    const { allEventTypes, logs } = useStream();
    const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
    const [dateOrder, setDateOrder] = useState<"Up" | "Down">("Up");
    const [eventSelected, setEventSelected] = useState<string>("");

    const displayedLogs = useMemo(() => {
        let filteredLogs = logs;

        if (targetId) {
            filteredLogs = filteredLogs.filter((log) => log.targetId === targetId);
        }

        if (eventSelected) {
            filteredLogs = filteredLogs.filter((log) => log.event === eventSelected);
        }

        filteredLogs.sort((a, b) => (dateOrder === "Up" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp));
        return filteredLogs;
    }, [logs, targetId, eventSelected, dateOrder]);

    const handleRowClick = (index: number | null) => {
        setSelectedLogIndex(selectedLogIndex === index ? null : index);
    };

    return (
        <div>
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
                </div>
            </div>
            <div className="overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr className="bg-base-200 text-white">
                            <th></th>
                            <th>Date</th>
                            <th>Event</th>
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
                                    <td>{log.message}</td>
                                    <td>{log.urgent ? "Yes" : "No"}</td>
                                </tr>
                                {selectedLogIndex === index && (
                                    <tr className="bg-base-100">
                                        <td colSpan={5}>
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
    );
};

export default LogsTable;
