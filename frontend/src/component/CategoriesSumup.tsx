import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { CategoriesSumup } from "../utils/Types";

import { formatMonthYear } from "../utils/Functions";
import DateSelector from "./DateSelector";

interface CategoriesSumupProps {
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

export default function CategoriesSumup({ className = "", month, year, startDate, endDate, addMonth, setMonthToNow, subtractMonth, setDates }: CategoriesSumupProps) {
    const [categoriesSumup, setCategoriesSumup] = useState<Array<CategoriesSumup>>([]);
    const [percentageMode, setPercentageMode] = useState<boolean>(false)
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
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
    }, [userId, year, month, startDate, endDate]);

    const total = categoriesSumup.reduce((acc, category) => acc + category.totalAmount, 0);

    const totalExpenses = categoriesSumup.reduce(
        (acc, category) =>
            category.totalAmount < 0 ? acc + category.totalAmount : acc,
        0
    );

    const totalRevenus = categoriesSumup.reduce(
        (acc, category) =>
            category.totalAmount > 0 ? acc + category.totalAmount : acc,
        0
    );

    return (
        <div className={`bg-stone-800 border border-stone-700 rounded-md p-4 flex flex-col ${className}`}>
            <h2 className="text-lg font-semibold mb-4 text-white">Total par catégorie - {formatMonthYear(year, month)}</h2>

            <DateSelector
                addMonth={addMonth}
                setMonthToNow={setMonthToNow}
                subtractMonth={subtractMonth}
                setDates={setDates}
            />

            <div className="flex-1 overflow-y-auto">
                {categoriesSumup.length === 0 ? (
                    <p className="text-white">Aucune donnée disponible pour cette période.</p>
                ) : (
                    <ul>
                        {categoriesSumup.map((category) => (
                            <li key={category.categoryLabel} className="flex justify-between px-4 mb-2 text-white">
                                <span>{category.categoryLabel}</span>
                                <span className={category.totalAmount < 0 ? "text-red-300" : "text-green-300"} onClick={() => setPercentageMode(prev => !prev)}>
                                    {percentageMode ? (
                                        category.totalAmount > 0 ? (
                                            totalRevenus === 0
                                                ? "0%"
                                                : `${((category.totalAmount / totalRevenus) * 100).toFixed(2)}%`
                                        ) : (
                                            totalExpenses === 0
                                                ? "0%"
                                                : `${((category.totalAmount / totalExpenses) * 100).toFixed(2)}%`
                                        )
                                    ) : (
                                        category.totalAmount.toFixed(2)
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-full mt-4 flex justify-between px-4 space-x-2">
                <span className="text-white self-center">Total :</span>
                <span className={`self-center ${total < 0 ? "text-red-500" : "text-green-500"}`}> {total.toFixed(2)} </span>
            </div>
        </div>
    );
};