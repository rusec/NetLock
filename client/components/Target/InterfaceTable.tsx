import { Beacon } from "netlocklib/dist/Beacon";
import React, { useState } from "react";

interface Props {
    ifaces: Beacon.networkInterface[];
}

const InterfaceTable: React.FC<Props> = ({ ifaces }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    return (
        <div>
            <span className="mr-1 card-title p-2">Interfaces:</span>
            <div className="overflow-x-hidden overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mac</th>
                            <th>IPv4</th>
                            <th>Subnet</th>
                            <th>State</th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll max-h-30">
                        {ifaces.map((iface, i) => (
                            <>
                                <tr
                                    key={iface.ifaceName}
                                    className={`hover:bg-neutral hover:text-white cursor-pointer ${
                                        iface.state == "up" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                                    }`}
                                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                                >
                                    <td>{iface.iface}</td>
                                    <td>{iface.mac}</td>
                                    <td>{iface.ip4}</td>
                                    <td>{iface.ip4subnet}</td>
                                    <td>{iface.state.toUpperCase()}</td>
                                </tr>
                                {selectedIndex === i && (
                                    <tr>
                                        <td colSpan={5}>
                                            <div className="mt-1 text-gray-600">
                                                <h3 className="text-lg font-bold">Interface Details:</h3>
                                                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{JSON.stringify(iface, null, 2)}</pre>
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

export default InterfaceTable;
