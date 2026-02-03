import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { CategoriesSumup, Budget } from "../utils/Types";
import ProgressBar from "./ProgressBar"

import { formatMonthYear } from "../utils/Functions";
import NewBudgetPopup from "./popups/NewBudgetPopup";
import DateSelector from "./DateSelector";

interface BudgetsProps {
    className?: string;
    month: number;
    year: number;
    startDate: string | null;
    endDate: string | null;
    addMonth: () => void;
    subtractMonth: () => void;
    setMonthToNow: () => void;
    setDates: (start: string, end: string) => void;
}

export default function Budgets({ className = "", month, year, startDate, endDate, addMonth, subtractMonth, setMonthToNow, setDates }: BudgetsProps) {
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
        if (
            startDate &&
            endDate &&
            new Date(startDate) instanceof Date &&
            !isNaN(new Date(startDate).getTime()) &&
            new Date(endDate) instanceof Date &&
            !isNaN(new Date(endDate).getTime())
        ) {
            api
                .get(`/budget/range`,
                    {
                        params: {
                            start: startDate,
                            end: endDate,
                        }
                    }
                )
                .then((res) => {
                    setBudgets(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching budgets", err)
                    setBudgets([]);
                });
        } else {
            api
                .get(`/budget/${month}/${year}`)
                .then((res) => {
                    setBudgets(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching budgets", err)
                    setBudgets([]);
                });
        }
    }

    async function fetchCategoriesSumup() {
        if (
            startDate &&
            endDate &&
            new Date(startDate) instanceof Date &&
            !isNaN(new Date(startDate).getTime()) &&
            new Date(endDate) instanceof Date &&
            !isNaN(new Date(endDate).getTime())
        ) {
            api
                .get(`/categories/sumup/range`,
                    {
                        params: {
                            start: startDate,
                            end: endDate,
                        },
                    }
                )
                .then((res) => {
                    setCategoriesSumup(res.data);
                })
                .catch((err) => console.error("Error fetching categories sumup", err));
        } else {
            api
                .get(`/categories/sumup`,
                    {
                        params: {
                            year: year,
                            month: month,
                        },
                    }
                )
                .then((res) => {
                    setCategoriesSumup(res.data);
                })
                .catch((err) => console.error("Error fetching categories sumup", err));
        }
    }

    useEffect(() => {
        fetchBudgets();
        fetchCategoriesSumup();
    }, [month, year, startDate, endDate]);

    useEffect(() => {
        fetchBudgets();
        fetchCategoriesSumup();
    }, []);

    return (
        <div className={className}>
            <NewBudgetPopup show={showNewTransactionPopup} onClose={newBudgetPopupCloseHandler} month={month} year={year} />
            <div className="flex flex-col h-full gap-4">
                <DateSelector
                    addMonth={addMonth}
                    setMonthToNow={setMonthToNow}
                    subtractMonth={subtractMonth}
                    setDates={setDates}
                />

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