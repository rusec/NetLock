import { LogEvent } from "netlocklib/dist/Events";
import React, { useEffect, useState } from "react";
import { convertDateToHumanReadable } from "../../utils/time";
import { useStream } from "../../hooks/StreamProvider";

type Props = {
    targetId: string;
};

function LogsTable({ targetId }: Props) {
    const { allEventTypes, logs } = useStream();
    const [TargetSelected, setTargetSelected] = useState<string>(targetId);

    const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
    const [DateUp, setDateUp] = useState<"Up" | "Down">("Up");
    const [DisplayedLogs, setDisplayedLogs] = useState(logs.filter((log) => log.targetId === TargetSelected));
    const [EventSelected, setEventSelected] = useState<string>("");

    useEffect(() => {
        let filteredLogs = logs;

        if (TargetSelected != "") {
            if (Array.isArray(TargetSelected)) filteredLogs = filteredLogs.filter((log) => TargetSelected.includes(log.targetId));
            else filteredLogs = filteredLogs.filter((log) => log.targetId === TargetSelected);
        }

        if (EventSelected != "") {
            if (Array.isArray(EventSelected)) filteredLogs = filteredLogs.filter((log) => EventSelected.includes(log.event));
            else filteredLogs = filteredLogs.filter((log) => log.event === EventSelected);
        }

        filteredLogs.sort((a, b) => (DateUp == "Up" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp));
        setDisplayedLogs(filteredLogs);
    }, [DateUp, logs, TargetSelected, EventSelected]);
    const handleRowClick = (index: number | null) => {
        setSelectedLogIndex(selectedLogIndex === index ? null : index);
    };
    return (
        <div className="">
            <div className="flex relative">
                <div className="card-title">Logs</div>
                <div className="ml-auto">
                    <div
                        onClick={() => {
                            setDateUp(DateUp == "Up" ? "Down" : "Up");
                        }}
                        role="button"
                        className="btn m-1"
                    >
                        {DateUp == "Up" ? "Recent" : "Old"}
                    </div>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn m-1">
                            Filter Event
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow">
                            <li>
                                <a onClick={() => setEventSelected("")}>All</a>
                            </li>
                            {allEventTypes.map((v) => (
                                <li>
                                    <a onClick={() => setEventSelected(v)}>{v}</a>
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
                        {DisplayedLogs.map((log, index) => (
                            <>
                                <tr key={index} className="hover:bg-neutral hover:text-white cursor-pointer" onClick={() => handleRowClick(index)}>
                                    <th>{index + 1}</th>
                                    <td>{convertDateToHumanReadable(log.timestamp)}</td>
                                    <td>{log.event.toUpperCase()}</td>
                                    <td>{log.message}</td>
                                    <td>{log.urgent ? "Yes" : "No"}</td>
                                </tr>
                                {selectedLogIndex === index && (
                                    <tr key={`${index}-details`} className="bg-base-100">
                                        <td colSpan={5}>
                                            <pre className="whitespace-pre-wrap p-4">{JSON.stringify(log, null, 2)}</pre>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LogsTable;
