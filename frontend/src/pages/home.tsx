import { useState, useRef } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Transaction } from "../types/Types";
import { useNavigate } from "react-router";
import "./home.css";

import SideBar from "../component/SideBar";
import NewTransactionPopup from "../component/NewTransactionPopup";
import CategoriesSumup from "../component/CategoriesSumup";
import TransactionsHistory from "../component/TransactionsHistory";

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");
    const [user, setUser] = useState<User | null>(null);
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const [recentTransactions, setRecentTransactions] = useState<Array<Transaction>>([]);
    const { userId, mail, logout } = useAuth();
    const [currentOffset, setCurrentOffset] = useState<number>(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const TRANSACTIONS_TO_FETCH = 20;

    const API_URL = (import.meta as any).env.VITE_API_URL;

    let navigate = useNavigate();

    const newTransactionPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
            clearTransactions();
            fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0);
        }
    }

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 10) {
            fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, currentOffset);
        }
    };

    function clearTransactions() {
        setRecentTransactions([]);
        setCurrentOffset(0);
    }

    async function fetchNewTransactionsPage(limit: number, offset: number) {
        axios
            .get(`${API_URL}/transactions/${userId}/${limit}/${offset * TRANSACTIONS_TO_FETCH}`)
            .then((res) => {
                if(res.data.length === 0) return;
                setRecentTransactions(recentTransactions.concat(res.data));
                setCurrentOffset(currentOffset + 1);
            })
            .catch((err) => console.error("Error fetching recent transactions", err));
    }

    async function deleteTransaction(transactionId: number) {
        axios
            .delete(`${API_URL}/transactions/${transactionId}`)
            .then(() => {
                fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0);
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
        clearTransactions();
        fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0);
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
                    <TransactionsHistory
                        className="col-span-2 row-span-5 border border-stone-300 rounded-lg p-4 flex flex-col h-full"
                        scrollRef={scrollRef}
                        handleScroll={handleScroll}
                        newTransactionPopupCloseHandler={newTransactionPopupCloseHandler}
                        deleteTransaction={deleteTransaction}
                        transactions={recentTransactions}
                    />

                    <CategoriesSumup className="col-span-2 row-span-5 border border-stone-300 rounded-lg p-4" />
                </div>

            </main>
        </div>
    );
}