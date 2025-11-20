import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import SideBar from "../component/SideBar";
import NewTransactionPopup from "../component/NewTransactionPopup";
import { User, Transaction } from "../types/Types";

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");
    const [user, setUser] = useState<User | null>(null);
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const [recentTransactions, setRecentTransactions] = useState<Array<Transaction>>([]);
    const { userId, mail, logout } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    const newTransactionPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
            getLastTransactions();
        }
    }

    async function getLastTransactions() {
        axios
            .get(`${API_URL}/transactions/${userId}/${5}`)
            .then((res) => {
                setRecentTransactions(res.data);
            })
            .catch((err) => console.error("Error fetching recent transactions", err));
    }

    useEffect(() => {
        axios
            .get(`${API_URL}/users/${userId}`)
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => console.error("Error fetching users", err));
    }, [userId]);

    useEffect(() => {
        getLastTransactions();
    }, []);



    return (
        <div className="flex h-screen w-screen bg-stone-900">
            <SideBar
                activeItem={activeItem}
                onItemClick={setActiveItem}
                userFirstName={user?.firstname}
                userLastName={user?.lastname}
            />

            <main className="w-full h-full flex">
                <NewTransactionPopup
                    onClose={newTransactionPopupCloseHandler}
                    show={showNewTransactionPopup}
                />
                <div className="grid grid-cols-6 auto-rows-[100px] gap-4 w-full">
                    {/*Recent transactions*/}
                    <div className="col-span-2 col-start-5 row-span-5 border border-stone-300 rounded-lg p-4 m-4 flex flex-col justify-center items-center">
                        <h2 className="text-white text-2xl mb-4">Dernières transactions</h2>

                        <table className="w-full h-full text-white border-collapse">
                            <thead className="bg-stone-700/10">
                                <tr>
                                    <th className="p-3 text-left border-b border-stone-500">Date</th>
                                    <th className="p-3 text-left border-b border-stone-500">Catégorie</th>
                                    <th className="p-3 text-right border-b border-stone-500">Montant</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-stone-700">
                                {recentTransactions.map((transaction) => (
                                    <tr key={transaction.transactionId}>
                                        <td className="p-3">{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td className="p-3">{transaction.categoryLabel}</td>
                                        <td className={`p-3 text-right ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>{transaction.amount}€</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="w-full flex sm:flex-col xl:flex-row justify-between items-center gap-8 mt-4">
                            <button className="w-1/2 rounded-lg bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors" onClick={() => newTransactionPopupCloseHandler(true)}>
                                Ajouter une transaction
                            </button>

                            <button className="w-1/2 rounded-lg bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors" onClick={() => { }}>
                                Voir tout
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}