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
}

export default function CategoriesSumup({className = ""}: CategoriesSumupProps) {
    const [categoriesSumup, setCategoriesSumup] = useState<Array<CategoriesSumup>>([]);
    const [yearToShow, setYearToShow] = useState<number>(() => {
        const now = new Date();
        return now.getFullYear();
    });
    const [monthToShow, setMonthToShow] = useState<number>(() => {
        const now = new Date();
        return now.getMonth() + 1;
    });
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
        axios
            .get(`${API_URL}/categories/sumup/${userId}`,
                {
                    params: {
                        year: yearToShow,
                        month: monthToShow,
                    },
                }
            )
            .then((res) => {
                setCategoriesSumup(res.data);
            })
            .catch((err) => console.error("Error fetching categories sumup", err));
    }, [userId, yearToShow, monthToShow]);

    const total = categoriesSumup.reduce((acc, category) => acc + category.totalAmount, 0);

    function addMonth(){
        if(monthToShow === 12){
            setMonthToShow(1);
            setYearToShow(yearToShow + 1);
        } else {
            setMonthToShow(monthToShow + 1);
        }
    }

    function subtractMonth(){
        if(monthToShow === 1){
            setMonthToShow(12);
            setYearToShow(yearToShow - 1);
        } else {
            setMonthToShow(monthToShow - 1);
        }
    }

    function setCurrentMonth(){
        const now = new Date();
        setYearToShow(now.getFullYear());
        setMonthToShow(now.getMonth() + 1);
    }

    return (
        <div className={`bg-stone-800 border border-stone-700 rounded-lg p-4 flex flex-col ${className}`}>
            <h2 className="text-lg font-semibold mb-4 text-white">Total par catégorie - {formatMonthYear(yearToShow, monthToShow)}</h2>
            <div className="w-full flex flex-row justify-center mb-4">
                <button className="text-white flex flex-row items-center border border-stone-700 rounded-l-lg p-2 cursor-pointer hover:bg-stone-700/80" onClick={subtractMonth}>
                    <ArrowLeft className="w-5 h-5 text-white" />
                    <p>Précédent</p>
                </button>

                <button className="text-white flex flex-row items-center border border-stone-700 p-2 cursor-pointer hover:bg-stone-700/80" onClick={setCurrentMonth}>
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
                            <li key={category.categoryLabel} className="flex justify-between mb-2 text-white">
                                <span>{category.categoryLabel}</span>
                                <span className={category.totalAmount < 0 ? "text-red-300" : "text-green-300"} >{category.totalAmount.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-full mt-4 flex justify-between space-x-2">
                <span className="text-white self-center">Total :</span>
                <span className={`self-center ${total < 0 ? "text-red-500" : "text-green-500"}`}> {total.toFixed(2)} </span>
            </div>
        </div>
    );
};