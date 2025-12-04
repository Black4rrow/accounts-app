import { useState, useMemo } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import SideBar from "../component/SideBar";
import { BarChart } from '@mui/x-charts/BarChart'
import { axisClasses } from '@mui/x-charts/ChartsAxis';

import { Transaction } from "../utils/Types";

export default function Statistics() {
    const [activeItem, setActiveItem] = useState<string>("statistics");
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([])
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    async function fetchMonthlyTransactions() {
        try {
            await axios
                .get(`${API_URL}/transactions/monthly/${userId}`, { params: { month: currentMonth, year: currentYear } })
                .then((res) => {
                    setMonthlyTransactions(res.data);
                });
        } catch (e) {
            setMonthlyTransactions([])
            console.log("Error fecthing monthly transactions : ", e)
        }
    }

    useEffect(() => {
        fetchMonthlyTransactions()
    }, [userId, currentMonth, currentYear])

    function getMonthlyTotals(): Record<string, number> {
        return monthlyTransactions.reduce((acc, t) => {
            acc[t.categoryLabel] = (acc[t.categoryLabel] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);
    }

    const chartData = useMemo(() =>
        Object.entries(getMonthlyTotals()).map(([label, total]) => ({ label, total })).filter((t) => t.total < 0).sort((a, b) => a.total < b.total ? 1 : -1),
        [monthlyTransactions]);

    return (
        <>
            <div className="flex min-h-screen w-screen bg-stone-900 relative">
                <SideBar
                    className=""
                    activeItem={activeItem}
                    onItemClick={setActiveItem}
                />

                <main className="w-full min-h-screen mt-16 sm:ml-64 sm:mt-2 flex flex-col">
                    <div className="w-full p-2 sm:p-6 flex flex-col sm:grid sm:grid-cols-1 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-2 auto-rows-[100px] gap-4">
                        <div className="w-full h-fit sm:col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 border border-stone-400 rounded-md">
                            <BarChart
                                className=""
                                dataset={chartData}
                                xAxis={[{
                                    dataKey: 'total',
                                    label: 'Montant',
                                    tickLabelStyle: { fill: '#fff', fontSize: 12 },
                                    labelStyle: { fill: '#fff', fontWeight: 600, fontSize: 13 },
                                }]}
                                series={[{
                                    dataKey: 'total',
                                    label: 'Montant',
                                    barLabel: 'value',
                                    color: 'rgba(199, 54, 54, 1)'
                                }]}
                                yAxis={[{
                                    width: 90,
                                    dataKey: 'label',
                                    tickLabelStyle: { fill: '#fff', fontSize: 12 },
                                    labelStyle: { fill: '#fff', fontWeight: 600 }
                                }]}
                                layout="horizontal"
                                slotProps={{
                                    barLabel: {
                                        placement: "outside",
                                        style: {
                                            fontWeight: 600,
                                            textAnchor: 'start',
                                            fill: '#fff',
                                            transform: 'translateX(8px)'
                                        }
                                    }
                                }}
                                height={chartData.length * 45}
                                margin={{ top: 24, left: 0, right: 10 }}
                                localeText={{
                                    loading: 'Chargement ...',
                                    noData: 'Aucune donnée'
                                }}
                                hideLegend={true}
                                sx={{
                                    '& .MuiChartsAxis-label, & .MuiChartsAxis-tickLabel': {
                                        fill: '#fff',
                                        fontWeight: 600,
                                        fontSize: 13,
                                    },

                                    '& .MuiChartsAxis-line, & .MuiChartsAxis-tickLine': {
                                        stroke: '#fff',
                                        strokeWidth: 0.8,
                                    },

                                    [`.${axisClasses.root}`]: {
                                        [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                                            stroke: '#fff',
                                            strokeWidth: 2,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
