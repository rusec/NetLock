import { Beacon } from "netlocklib/dist/Beacon";
import React, { useState } from "react";

interface Props {
    apps: Beacon.application[];
}

const AppTable: React.FC<Props> = ({ apps }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    return (
        <div>
            <span className="mr-1 card-title p-2">Apps:</span>

            <div className="overflow-x-hidden overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Running</th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll max-h-30">
                        {apps.map((app, i) => (
                            <>
                                <tr
                                    key={app.name}
                                    className={`hover:bg-neutral hover:text-white cursor-pointer ${
                                        app.running ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                                    }`}
                                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                                >
                                    <td>{app.name}</td>
                                    <td>{app.running ? "Yes" : "No"}</td>
                                </tr>
                                {selectedIndex === i && (
                                    <tr>
                                        <td colSpan={2}>
                                            <div className="mt-1 text-gray-600">
                                                <h3 className="text-lg font-bold">App Details:</h3>
                                                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{JSON.stringify(app, null, 2)}</pre>
                                            </div>
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
};

export default AppTable;
