import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { CategoriesSumup } from "../types/Types";

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

    return (
        <div className={`bg-stone-800 border border-stone-700 rounded-lg p-4 flex flex-col ${className}`}>
            <h2 className="text-lg font-semibold mb-4 text-white">Total par catégorie</h2>
            <div className="flex-1 overflow-y-auto">
                {categoriesSumup.length === 0 ? (
                    <p className="text-white">Aucune donnée disponible pour cette période.</p>
                ) : (
                    <ul>
                        {categoriesSumup.map((category) => (
                            <li key={category.categoryLabel} className="flex justify-between mb-2 text-white">
                                <span>{category.categoryLabel}</span>
                                <span className={category.totalAmount < 0 ? "text-red-300" : "text-green-300"} >{category.totalAmount}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};