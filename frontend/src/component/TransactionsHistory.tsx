import React, { useRef } from "react";
import { Transaction } from "../types/Types";
import { Trash2 } from "lucide-react";

interface TransactionsHistoryProps {
    transactions: Array<Transaction>;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    handleScroll: () => void;
    newTransactionPopupCloseHandler: (open: boolean) => void;
    deleteTransaction: (transactionId: number) => void;
    className?: string;
}

export default function TransactionsHistory(props: TransactionsHistoryProps) {
    return (
        <div className={props.className}>
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
                    ref={props.scrollRef}
                    onScroll={props.handleScroll}
                    className="overflow-y-auto custom-scroll"
                >
                    <ul className="divide-y divide-stone-700">
                        {props.transactions.map((transaction) => (
                            <li
                                key={transaction.transactionId}
                                className="group relative grid grid-cols-12 items-center h-16"
                            >
                                <button
                                    onClick={() => props.deleteTransaction(transaction.transactionId)}
                                    aria-label="Supprimer transaction"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-600/20 z-20"
                                    type="button"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>

                                <div className="col-span-3 p-0">
                                    <div className="h-16 pl-2 pr-3 flex items-center justify-start text-white">
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
                                            {transaction.amount}€
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>


            <div className="w-full flex sm:flex-col justify-between items-center gap-4 mt-4">
                <button
                    className="w-full rounded-lg bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
                    onClick={() => props.newTransactionPopupCloseHandler(true)}
                >
                    Ajouter une transaction
                </button>
            </div>
        </div>
    );
}