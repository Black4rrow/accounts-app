import { useState, useRef } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Transaction } from "../utils/Types";
import { useNavigate } from "react-router";
import "./home.css";

import SideBar from "../component/SideBar";
import CategoriesSumup from "../component/CategoriesSumup";
import TransactionsHistory from "../component/TransactionsHistory";
import Budgets from "../component/Budgets";

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");
    const [user, setUser] = useState<User | null>(null);

    const { userId, mail, logout } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    let navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${API_URL}/users/${userId}`)
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => console.error("Error fetching users", err));
    }, [userId]);

    return (
        <div className="flex min-h-screen w-screen bg-stone-900 relative">
            <SideBar
                className=""
                activeItem={activeItem}
                onItemClick={setActiveItem}
                userFirstName={user?.firstname}
                userLastName={user?.lastname}
            />

            <main className="w-full min-h-screen mt-16 sm:mt-2 flex flex-col">
                <div className="w-full h-fit flex flex-col px-4 text-stone-200 justify-start gap-4 p-2 sm:p-6">
                    <h1 className="text-2xl font-bold"> Bienvenue sur Compti !</h1>
                    <p className="text-italic">Faites vos comptes facilement, mettez en place des budgets, et obtenez des graphes pour mieux gérer vos finances.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 auto-rows-[100px] gap-4 w-full p-2 sm:p-6">
                    {/*Recent transactions*/}
                    <TransactionsHistory
                        className="col-span-1 xl:col-span-3 lg:col-span-2 md:col-span-2 row-span-5 border border-stone-300 rounded-lg p-2 sm:p-4 flex flex-col h-full"
                    />

                    <CategoriesSumup className="col-span-1 xl:col-span-3 lg:col-span-2 md:col-span-2 row-span-5 border border-stone-300 rounded-lg p-2 sm:p-4" />

                    <Budgets className="col-span-1 xl:col-span-4 lg:col-span-3 md:col-span-2 row-span-4 border border-stone-300 rounded-lg p-2 sm:p-4" />
                </div>

            </main>
        </div>
    );
}