import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Transaction } from "../utils/Types";
import { Trash2 } from "lucide-react";
import NewTransactionPopup from "./popups/TransactionPopup";
import { replace } from "react-router";

interface TransactionsHistoryProps {
    className?: string;
}

export default function TransactionsHistory(props: TransactionsHistoryProps) {
    const [currentOffset, setCurrentOffset] = useState<number>(0);
    const [recentTransactions, setRecentTransactions] = useState<Array<Transaction>>([]);
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    const TRANSACTIONS_TO_FETCH = 20;
    const API_URL = (import.meta as any).env.VITE_API_URL;
    const { userId } = useAuth();

    const fetchTokenRef = useRef<number>(0);

    const bumpFetchToken = () => {
        fetchTokenRef.current += 1;
    };


    const newTransactionPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
            setTransactionToEdit(null);
            bumpFetchToken();
            setRecentTransactions([]);
            setCurrentOffset(0);
            setHasMore(true);
            fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0, { replace: true, force: true });
        }
    };

    const openEditPopup = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        newTransactionPopupCloseHandler(true);
    };

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container || isFetching || !hasMore) return;

        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 10) {
            fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, currentOffset, { replace: false });
        }
    };

    function clearTransactions() {
        setRecentTransactions([]);
        setCurrentOffset(0);
        setHasMore(true);
    }

    async function fetchNewTransactionsPage(limit: number, offset: number, opts: { replace?: boolean, force?: boolean } = {}) {
        if (!opts.force && (isFetching || !hasMore)) return;
        setIsFetching(true);

        const tokenAtCall = fetchTokenRef.current;

        try {
            const start = offset * TRANSACTIONS_TO_FETCH;
            const res = await api.get(`/transactions`, { params: { limit: limit, offset: start } });

            if (tokenAtCall !== fetchTokenRef.current) {
                return;
            }

            const data: Array<Transaction> = res.data;

            if (!data.length) {
                setHasMore(false);
                setIsFetching(false);
                return;
            }

            if (opts.replace) {
                setRecentTransactions(data);
                setCurrentOffset(1);
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                }
            } else {
                setRecentTransactions(prev => prev.concat(data));
                setCurrentOffset(prev => prev + 1);
            }
        } catch (err) {
            console.error("Error fetching transactions", err);
        } finally {
            setIsFetching(false);
        }
    }

    async function deleteTransaction(transactionId: number) {
        try {
            await api.delete(`/transactions/${transactionId}`);
            bumpFetchToken();
            setRecentTransactions([]);
            setCurrentOffset(0);
            setHasMore(true);
            fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0, { replace: true });
        } catch (err) {
            console.error("Error deleting transaction", err);
        }
    }

    useEffect(() => {
        fetchNewTransactionsPage(TRANSACTIONS_TO_FETCH, 0, { replace: true });
    }, []);

    return (
        <div className={props.className}>
            <NewTransactionPopup
                onClose={newTransactionPopupCloseHandler}
                show={showNewTransactionPopup}
                transaction={transactionToEdit || undefined}
            />
            <h2 className="text-white text-2xl mb-4">Dernières transactions</h2>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
                <div className="sticky top-0 z-20 bg-stone-800 border-b border-stone-700">
                    <div className="grid grid-cols-12 items-center">
                        <div className="col-span-3 p-3 text-left font-semibold text-white text-sm">Date</div>
                        <div className="col-span-6 p-3 text-left font-semibold text-white text-sm">Catégorie</div>
                        <div className="col-span-3 p-3 text-right font-semibold text-white text-sm">Montant</div>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto custom-scroll"
                >
                    <ul className="divide-y divide-stone-700">
                        {recentTransactions.map((transaction, index) => {
                            const currentDate = new Date(transaction.date);
                            const currentMonth = currentDate.toLocaleString("fr-FR", { month: "long" });
                            const currentYear = currentDate.getFullYear();

                            const prevTransaction = recentTransactions[index - 1];
                            let showMonthHeader = false;

                            if (!prevTransaction) {
                                showMonthHeader = true;
                            } else {
                                const prevDate = new Date(prevTransaction.date);
                                const prevMonth = prevDate.toLocaleString("fr-FR", { month: "long" });
                                const prevYear = prevDate.getFullYear();

                                if (prevMonth !== currentMonth || prevYear !== currentYear) {
                                    showMonthHeader = true;
                                }
                            }

                            return (
                                <React.Fragment key={transaction.transactionId}>
                                    {showMonthHeader && (
                                        <li className="w-full py-2 px-3 mt-8 bg-none border border-0 border-b-1 border-stone-300 text-stone-300 font-semibold">
                                            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
                                        </li>
                                    )}

                                    <li
                                        className="group relative cursor-pointer hover:bg-stone-700 grid grid-cols-12 items-center h-16"
                                        onClick={ () => {openEditPopup(transaction)} }
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTransaction(transaction.transactionId);
                                            }}
                                            aria-label="Supprimer transaction"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-200/90 sm:bg-none p-2 sm:p-1 rounded-md hover:bg-red-600/75 z-20 cursor-pointer"
                                            type="button"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-800 sm:text-red-600" />
                                        </button>

                                        <div className="col-span-3 p-0">
                                            <div className="h-16 pl-2 pr-3 flex items-center justify-start text-white text-sm sm:text-md">
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="col-span-6 p-0">
                                            <div className="h-16 px-3 flex flex-col justify-center text-white">
                                                <span className="font-semibold">{transaction.categoryLabel}</span>
                                                <span className="text-xs text-stone-300">{transaction.description}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-3 p-0">
                                            <div className="h-16 px-3 flex items-center justify-end">
                                                <span className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                                                    {transaction.amount > 0 ? "+" : ""}{transaction.amount}€
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                </React.Fragment>
                            )
                        })}
                    </ul>
                </div>
            </div>


            <div className="w-full flex sm:flex-col justify-between items-center gap-4 mt-4">
                <button
                    className="w-full rounded-md bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
                    onClick={() => newTransactionPopupCloseHandler(true)}
                >
                    Ajouter une transaction
                </button>
            </div>
        </div>
    );
}