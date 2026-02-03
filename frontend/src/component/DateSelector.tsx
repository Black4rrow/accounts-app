import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft, ArrowRight, CalendarDaysIcon
} from "lucide-react";

import {
    DateRangePicker,
    Range,
    RangeKeyDict
} from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateSelectorParams {
    className?: string;
    addMonth: () => void;
    subtractMonth: () => void;
    setMonthToNow: () => void;
    setDates: (start: string, end: string) => void;
}

export default function DateSelector(
    {
        className = "",
        addMonth,
        subtractMonth,
        setMonthToNow,
        setDates
    }: DateSelectorParams
) {

    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const [selection, setSelection] = useState<Range>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(),
        key: 'selection',
    });

    function onDateRangeSelected(range: any) {
        console.log(range);
    }

    const popoverRef = useRef<HTMLDivElement | null>(null);

    const toggleCalendar = () => setShowCalendar(prev => !prev);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node)
            ) {
                setShowCalendar(false);
            }
        }

        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    function formatDateLocal(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    const handleConfirm = () => {
        if (!selection.startDate || !selection.endDate) return;

        const start = formatDateLocal(selection.startDate);
        const end = formatDateLocal(selection.endDate);

        console.log("start : ", start);
        console.log("end : ", end);
        console.log("----------------------");

        setDates(start, end);
        setShowCalendar(false);
    };

    const handleCancel = () => {
        setShowCalendar(false);
    };

    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    return (
        <>
            <div className={`${className} w-full flex flex-row justify-center mb-4`}>
                <div className={`flex flex-row justify-center`}>
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

                <div className="ml-3">
                    <button
                        onClick={toggleCalendar}
                        className="text-white flex items-center border border-stone-700 rounded-md px-3 py-2 hover:bg-stone-700/80"
                        aria-haspopup="dialog"
                        aria-expanded={showCalendar}
                    >
                        <CalendarDaysIcon />
                    </button>

                    {showCalendar && (
                        <div
                            ref={popoverRef}
                            className="absolute right-0 mt-2 z-50 bg-white shadow-lg rounded-md p-2"
                            style={{ minWidth: 320 }}
                        >
                            <DateRangePicker
                                ranges={[selection]}
                                onChange={(ranges: RangeKeyDict) => {
                                    const next = ranges.selection;
                                    if (next) setSelection(next);
                                }}
                                moveRangeOnFirstSelection={false}
                                months={1}
                                direction="horizontal"
                            />

                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1 rounded-md border border-stone-300 hover:bg-stone-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleConfirm}
                                    className="px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}