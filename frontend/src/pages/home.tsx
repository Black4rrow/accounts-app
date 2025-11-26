import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Transaction } from "../types/Types";
import { useNavigate } from "react-router";
import {
    Trash2
} from "lucide-react";
import "./home.css";

import SideBar from "../component/SideBar";
import NewTransactionPopup from "../component/NewTransactionPopup";
import CategoriesSumup from "../component/CategoriesSumup";

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");
    const [user, setUser] = useState<User | null>(null);
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const [recentTransactions, setRecentTransactions] = useState<Array<Transaction>>([]);
    const { userId, mail, logout } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    let navigate = useNavigate();

    const newTransactionPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
            getLastTransactions();
        }
    }

    async function getLastTransactions() {
        axios
            .get(`${API_URL}/transactions/${userId}/${20}`)
            .then((res) => {
                setRecentTransactions(res.data);
            })
            .catch((err) => console.error("Error fetching recent transactions", err));
    }

    async function deleteTransaction(transactionId: number) {
        axios
            .delete(`${API_URL}/transactions/${transactionId}`)
            .then(() => {
                getLastTransactions();
            })
            .catch((err) => console.error("Error deleting transaction", err));
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
                className="hidden sm:flex"
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

                <div className="grid grid-cols-1 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 auto-rows-[100px] gap-4 w-full p-6">
                    {/*Recent transactions*/}
                    <div className="col-span-2 row-span-5 border border-stone-300 rounded-lg p-4 flex flex-col h-full">
                        <h2 className="text-white text-2xl mb-4">Dernières transactions</h2>

                        <div className="w-full flex-1 flex flex-col overflow-hidden">
                            <div className="overflow-y-auto custom-scroll">
                                <table className="w-full text-white border-collapse table-fixed">
                                    <thead>
                                        <tr>
                                            <th className="p-3 text-left border-b border-stone-500 w-1/4 sticky top-0 bg-stone-900 z-10">Date</th>
                                            <th className="p-3 text-left border-b border-stone-500 w-1/2 sticky top-0 bg-stone-900 z-10">Catégorie</th>
                                            <th className="p-3 text-right border-b border-stone-500 w-1/4 sticky top-0 bg-stone-900 z-10">Montant</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-stone-700">
                                        {recentTransactions.map((transaction) => (
                                            <tr key={transaction.transactionId} className="group h-16">
                                                <td className="p-0 relative">
                                                    <div className="h-16 px-3 flex items-center">
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </div>

                                                    <button
                                                        onClick={() => deleteTransaction(transaction.transactionId)}
                                                        className="absolute left-[-6] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-600/20 z-20"
                                                        aria-label="Supprimer transaction"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </td>

                                                <td className="p-0">
                                                    <div className="h-16 px-3 flex flex-col justify-center">
                                                        <span className="font-semibold">{transaction.categoryLabel}</span>
                                                        <span className="text-xs text-stone-300">{transaction.description}</span>
                                                    </div>
                                                </td>

                                                <td className="p-0">
                                                    <div className="h-16 px-3 flex items-center justify-end">
                                                        <span className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                                                            {transaction.amount}€
                                                        </span>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="w-full flex sm:flex-col justify-between items-center gap-4 mt-4">
                            <button
                                className="w-full rounded-lg bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
                                onClick={() => newTransactionPopupCloseHandler(true)}
                            >
                                Ajouter une transaction
                            </button>

                            <button
                                className="w-full rounded-lg bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
                                onClick={() => { navigate('/history') }}
                            >
                                Voir tout
                            </button>
                        </div>
                    </div>

                    <CategoriesSumup className="col-span-2 row-span-5 border border-stone-300 rounded-lg p-4" />
                </div>

            </main>
        </div>
    );
}