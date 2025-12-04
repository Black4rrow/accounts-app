import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CategoriesSumup } from "../utils/Types";
import {
    ArrowLeft, ArrowRight
} from "lucide-react";

import { formatMonthYear } from "../utils/Functions";

interface CategoriesSumupProps {
    className?: string;
    month: number;
    year: number;
    addMonth: () => void;
    subtractMonth: () => void;
    setMonthToNow: () => void;
}

export default function CategoriesSumup({className = "", month, year, addMonth, setMonthToNow, subtractMonth}: CategoriesSumupProps) {
    const [categoriesSumup, setCategoriesSumup] = useState<Array<CategoriesSumup>>([]);
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${API_URL}/categories/sumup/${userId}`,
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
    }, [userId, year, month]);

    const total = categoriesSumup.reduce((acc, category) => acc + category.totalAmount, 0);

    return (
        <div className={`bg-stone-800 border border-stone-700 rounded-lg p-4 flex flex-col ${className}`}>
            <h2 className="text-lg font-semibold mb-4 text-white">Total par catégorie - {formatMonthYear(year, month)}</h2>
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
            <div className="flex-1 overflow-y-auto">
                {categoriesSumup.length === 0 ? (
                    <p className="text-white">Aucune donnée disponible pour cette période.</p>
                ) : (
                    <ul>
                        {categoriesSumup.map((category) => (
                            <li key={category.categoryLabel} className="flex justify-between px-4 mb-2 text-white">
                                <span>{category.categoryLabel}</span>
                                <span className={category.totalAmount < 0 ? "text-red-300" : "text-green-300"} >{category.totalAmount.toFixed(2)}</span>
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