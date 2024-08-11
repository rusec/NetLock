import { Beacon } from "netlocklib/dist/Beacon";
import React, { useState } from "react";

interface Props {
    services: Beacon.service[];
}
const ServiceTable: React.FC<Props> = ({ services }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    return (
        <div>
            <span className="mr-1 card-title p-2">Services:</span>

            <div className="overflow-x-hidden overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr>
                            <th>Protocol</th>
                            <th>Port</th>
                            <th>Local Address</th>
                            <th>Service</th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll max-h-30">
                        {services.map((service, i) => (
                            <>
                                <tr
                                    key={service.port.localPort}
                                    className={`hover:bg-neutral hover:text-white cursor-pointer bg-blue-200 text-blue-800`}
                                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                                >
                                    <td>{service.port.protocol}</td>
                                    <td>{service.port.localPort}</td>
                                    <td>{service.port.localAddress}</td>
                                    <td>{service.service?.name}</td>
                                </tr>
                                {selectedIndex === i && (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="mt-1 text-gray-600">
                                                <h3 className="text-lg font-bold">Services Details:</h3>
                                                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{JSON.stringify(service, null, 2)}</pre>
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

export default ServiceTable;
