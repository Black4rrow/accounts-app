import { useState, useRef } from "react";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Transaction } from "../utils/Types";
import { useNavigate } from "react-router";
import "./home.css";

import SideBar from "../component/SideBar";
import CategoriesSumup from "../component/CategoriesSumup";
import TransactionsHistory from "../component/TransactionsHistory";
import Budgets from "../component/Budgets";

export default function Home() {
    const [activeItem, setActiveItem] = useState<string>("home");

    //variables for synchronized stats
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);


    const { userId, mail, logout } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    let navigate = useNavigate();

    function addMonth() {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setStartDate(null);
        setEndDate(null);
    }

    function subtractMonth() {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setStartDate(null);
        setEndDate(null);
    }

    function setMonthToNow() {
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth() + 1);
        setStartDate(null);
        setEndDate(null);
    }

    function setDates(start: string, end: string) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
            return;
        }

        setStartDate(start);
        setEndDate(end);
    }

    return (
        <div className="flex min-h-screen w-screen bg-stone-900 relative">
            <SideBar
                className=""
                activeItem={activeItem}
                onItemClick={setActiveItem}
            />

            <main className="w-full min-h-screen mt-16 sm:ml-64 sm:mt-2 flex flex-col">
                <div className="w-full h-fit flex flex-col px-4 text-stone-200 justify-start gap-4 p-2 sm:p-6">
                    <h1 className="text-2xl font-bold"> Bienvenue sur Compti !</h1>
                    <p className="text-italic">Faites vos comptes facilement, mettez en place des budgets, et obtenez des graphes pour mieux gérer vos finances.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 auto-rows-[100px] gap-4 w-full p-2 sm:p-6">
                    <TransactionsHistory
                        className="col-span-1 xl:col-span-3 lg:col-span-2 md:col-span-2 row-span-5 border border-stone-300 rounded-md p-2 sm:p-4 flex flex-col h-full"
                    />

                    <CategoriesSumup
                        className="col-span-1 xl:col-span-3 lg:col-span-2 md:col-span-2 row-span-5 border border-stone-300 rounded-md p-2 sm:p-4"
                        month={currentMonth}
                        year={currentYear}
                        startDate={startDate}
                        endDate={endDate}
                        addMonth={addMonth}
                        subtractMonth={subtractMonth}
                        setMonthToNow={setMonthToNow}
                        setDates={setDates}
                    />

                    <Budgets
                        className="col-span-1 xl:col-span-4 lg:col-span-3 md:col-span-2 row-span-4 border border-stone-300 rounded-md p-2 sm:p-4"
                        month={currentMonth}
                        year={currentYear}
                        startDate={startDate}
                        endDate={endDate}
                        addMonth={addMonth}
                        subtractMonth={subtractMonth}
                        setMonthToNow={setMonthToNow}
                        setDates={setDates}
                    />
                </div>

            </main>
        </div>
    );
}