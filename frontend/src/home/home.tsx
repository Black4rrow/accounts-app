import { useState } from "react";
import axios from "axios";

type User = {
    userId: string;
    firstname: string;
    lastname: string;
    mail: string;
    password: string;
    phoneNumber: string;
};

export default function Home() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [users, setUsers] = useState<User[]>([]);
    async function fetchUsers() {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    return (
        <div className="border p-4">
            <h1 className="font-bold text-2xl">Welcome to My Social Network</h1>
            <p className="text-gray-600">Connected to {API_URL}</p>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={fetchUsers}
            >
                Fetch Users
            </button>
            <ul className="mt-4">
                {users.map((user) => (
                    <li key={user.userId} className="border-b py-2">
                        {user.firstname} {user.lastname} ({user.mail})
                    </li>
                ))}
            </ul>
        </div>
    );
}