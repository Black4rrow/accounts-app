import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SideBar from "../component/SideBar";

type User = {
    userId: string;
    firstname: string;
    lastname: string;
    mail: string;
    password: string;
    phoneNumber: string;
};

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");
    const [user, setUser] = useState<User | null>(null);
    const { userId, mail, logout } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${API_URL}/users/${userId}`)
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => console.error("Error fetching users", err));
    }, [userId]);

    return (
        <div className="flex h-screen w-screen bg-stone-900">
            <SideBar
                activeItem={activeItem}
                onItemClick={setActiveItem}
                userFirstName={user?.firstname}
                userLastName={user?.lastname}
            />

        </div>
    );
}