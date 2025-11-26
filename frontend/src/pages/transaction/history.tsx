import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import SideBar from "../../component/SideBar";
import NewTransactionPopup from "../../component/NewTransactionPopup";
import { Transaction } from "../../types/Types";

export default function TransactionHistory() {
    const [activeItem, setActiveItem] = useState<string>("history");
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<Array<Transaction>>([]);
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    const newTransactionPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
        }
    }

    async function fetchTransactions(limit: number, offset: number) {
        let url = `${API_URL}/transactions/${userId}/${limit}/${offset}`;

        axios
            .get(url)
            .then((res) => {
                setTransactions(transactions.concat(res.data));
            })
            .catch((err) => console.error("Error fetching transactions", err));
    }

    function clearTransactions() {
        setTransactions([]);
    }

    useEffect(() => {
        clearTransactions();
        fetchTransactions(20, 0);
    }, [userId]);

    return (
        <div className="flex h-screen w-screen bg-stone-900">
            <SideBar
                activeItem={activeItem}
                onItemClick={setActiveItem}
            />
            <main className="w-full h-full flex flex-col p-4">
                <h1 className="text-3xl text-white mb-4">Historique des transactions</h1>
            </main>
        </div>
    );
};