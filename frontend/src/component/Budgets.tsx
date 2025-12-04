import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CategoriesSumup, Budget } from "../utils/Types";
import {
    ArrowLeft, ArrowRight
} from "lucide-react";
import ProgressBar from "./ProgressBar"

import { formatMonthYear } from "../utils/Functions";
import NewBudgetPopup from "./popups/NewBudgetPopup";

interface BudgetsProps {
    className?: string;
    month: number;
    year: number;
    addMonth: () => void;
    subtractMonth: () => void;
    setMonthToNow: () => void;
}

export default function Budgets({ className = "", month, year, addMonth, subtractMonth, setMonthToNow }: BudgetsProps) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categoriesSumup, setCategoriesSumup] = useState<CategoriesSumup[]>([]);
    const [showNewTransactionPopup, setShowNewTransactionPopup] = useState<boolean>(false);
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    const newBudgetPopupCloseHandler = (open: boolean) => {
        setShowNewTransactionPopup(open);
        if (!open) {
            clearLists();
            fetchBudgets();
            fetchCategoriesSumup();
        }
    }

    function clearLists() {
        setBudgets([]);
        setCategoriesSumup([]);
    }

    async function fetchBudgets() {
        axios
            .get(`${API_URL}/budget/${userId}/${month}/${year}`)
            .then((res) => {
                setBudgets(res.data);
            })
            .catch((err) => {
                console.error("Error fetching budgets", err)
                setBudgets([]);
            });
    }

    async function fetchCategoriesSumup() {
        axios
            .get(`${API_URL}/categories/sumup/${userId}`,
                { params: { month: month, year: year } }
            ).then((res) => {
                setCategoriesSumup(res.data);
            })
            .catch((err) => console.error("Error fetching categories sumup", err));
    }

    useEffect(() => {
        fetchBudgets();
        fetchCategoriesSumup();
    }, [month, year]);

    useEffect(() => {
        fetchBudgets();
        fetchCategoriesSumup();
    }, []);

    return (
        <div className={className}>
            <NewBudgetPopup show={showNewTransactionPopup} onClose={newBudgetPopupCloseHandler} month={month} year={year} />
            <div className="flex flex-col h-full gap-4">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-semibold text-white text-center">
                        Budgets - {formatMonthYear(year, month)}
                    </h2>
                    <div className="w-full flex flex-row justify-center mb-4">
                        <button className="text-white flex flex-row items-center border border-stone-700 rounded-l-lg p-2 cursor-pointer hover:bg-stone-700/80" onClick={subtractMonth}>
                            <ArrowLeft className="w-5 h-5 text-white" />
                            <p>Précédent</p>
                        </button>

                        <button className="text-white flex flex-row items-center border border-stone-700 p-2 cursor-pointer hover:bg-stone-700/80" onClick={setMonthToNow}>
                            <p>Actuel</p>
                        </button>

                        <button className="text-white flex flex-row items-center border border-stone-700 rounded-r-lg p-2 cursor-pointer hover:bg-stone-700/80" onClick={addMonth}>
                            <p>Suivant</p>
                            <ArrowRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {budgets?.length === 0 ? (
                        <p className="text-white">Aucun budget défini pour ce mois.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {budgets.map((budget) => {
                                const categorySumup = categoriesSumup.find(cs => cs.categoryId === budget.categoryId);
                                const categoryTotal = categorySumup ? categorySumup.totalAmount : 0;
                                const categoryLabel = categorySumup ? categorySumup.categoryLabel : "Erreur";
                                const categoryId = categorySumup ? categorySumup.categoryId : -1;
                                const budgetAmount = budget.amount;

                                const progressPercentage = Math.min((Math.abs(categoryTotal) / budgetAmount) * 100, 100);

                                return (
                                    <li key={budget.categoryId} className="flex justify-between text-white">
                                        <div className="flex flex-row w-full h-full">
                                            <p className="w-1/6 font-semibold">{budget.categoryLabel}</p>
                                            <div className="w-5/6 flex flex-row">
                                                <p className="">{Math.abs(categoryTotal)}</p>
                                                <div className="h-full w-full px-4 flex items-center">
                                                    <ProgressBar
                                                        value={progressPercentage}
                                                        height={18}
                                                        radius={999} />
                                                </div>
                                                <p className="">{budget.amount}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="mt-auto w-full sm:w-1/2">
                    <button
                        className="w-full rounded-md bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
                        onClick={() => setShowNewTransactionPopup(true)}
                    >
                        Ajouter un budget
                    </button>
                </div>
            </div>
        </div>
    );
}