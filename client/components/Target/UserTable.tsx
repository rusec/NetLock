import { Beacon } from "netlocklib/dist/Beacon";
import React, { useState } from "react";

interface Props {
    users: Beacon.user[];
}

const UsersTable: React.FC<Props> = ({ users }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    return (
        <>
            <span className="mr-1 card-title p-2">Users:</span>

            <div className="overflow-x-hidden overflow-y-auto max-h-[30rem]">
                <table className="table w-full table-pin-rows">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Logged in</th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll max-h-30">
                        {users.map((user, i) => (
                            <>
                                <tr
                                    key={user.name}
                                    className={`hover:bg-neutral hover:text-white cursor-pointer ${
                                        user.loggedIn ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                                    }`}
                                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                                >
                                    <td>{user.name}</td>
                                    <td>{user.loggedIn ? "Yes" : "No"}</td>
                                </tr>
                                {selectedIndex === i && (
                                    <tr>
                                        <td colSpan={2}>
                                            <div className="mt-1 text-gray-600">
                                                <h3 className="text-lg font-bold">User Details:</h3>
                                                <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default UsersTable;
