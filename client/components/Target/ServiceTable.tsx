import { Beacon } from "netlocklib/dist/Beacon";
import React, { useState, useMemo } from "react";

interface Props {
    services: Beacon.service[];
}

const ServiceTable: React.FC<Props> = ({ services }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

    const sortedServices = useMemo(() => {
        let sortableServices = [...services];

        if (sortConfig !== null) {
            if (sortConfig.key == "name") {
                sortableServices.sort((a: Beacon.service, b: Beacon.service) => {
                    let valueA = (a.service ? a.service[sortConfig.key] : 1) || 1;
                    let valueB = (b.service ? b.service[sortConfig.key] : 1) || 1;
                    if (valueA < valueB) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    }
                    return 0;
                });
            } else
                sortableServices.sort((a: Beacon.service, b: Beacon.service) => {
                    let valueA = a.port[sortConfig.key] || 1;
                    let valueB = b.port[sortConfig.key] || 1;
                    if (valueA < valueB) {
                        return sortConfig.direction === "ascending" ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return sortConfig.direction === "ascending" ? 1 : -1;
                    }
                    return 0;
                });
        }

        return sortableServices;
    }, [services, sortConfig]);

    const requestSort = (key: string) => {
        let direction = "ascending";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    return (
        <div>
            <span className="mr-1 card-title p-2">Services:</span>

            <div className="overflow-x-hidden overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr>
                            <th className="hover:text-white cursor-pointer select-none" onClick={() => requestSort("protocol")}>
                                Protocol
                            </th>
                            <th className="hover:text-white cursor-pointer select-none" onClick={() => requestSort("localPort")}>
                                Port
                            </th>
                            <th className="hover:text-white cursor-pointer select-none" onClick={() => requestSort("localAddress")}>
                                Local Address
                            </th>
                            <th className="hover:text-white cursor-pointer select-none" onClick={() => requestSort("name")}>
                                Service
                            </th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll max-h-30">
                        {sortedServices.map((service, i) => (
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
