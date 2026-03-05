import React, { useEffect, useState } from "react";
import api from "../../api";
import PropTypes from "prop-types";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";
import AutocompleteFreeText from "../AutoCompleteInput";
import { Transaction } from "../../utils/Types";

interface NewTransactionPopupProps {
    show: boolean;
    onClose?: (open: boolean) => void;
    transaction?: Transaction;
}

interface TransactionPayload {
    categoryLabel: string;
    amount: number;
    date: string;
    description: string;
    isExpense: boolean;
}

const NewTransactionPopup: React.FC<NewTransactionPopupProps> = ({ show: showProp, onClose, transaction }) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const [show, setShow] = useState(false);
    const [categories, setCategories] = useState<Array<{ categoryId: number; categoryLabel: string }>>([]);
    const [categoryValue, setCategoryValue] = useState<string>("");
    const [amount, setAmount] = useState<number | "">("");
    const [isExpense, setIsExpense] = useState<boolean>(true);
    const [date, setDate] = useState<string>(currentDate);
    const [description, setDescription] = useState<string>("");
    const { userId } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = (import.meta as any).env.VITE_API_URL;

    useEffect(() => {
        if (transaction) {
            setCategoryValue(transaction.categoryLabel);
            setAmount(Math.abs(transaction.amount));
            setIsExpense(transaction.amount < 0);
            setDate(transaction.date);
            setDescription(transaction.description);
        } else {
            setCategoryValue("");
            setAmount("");
            setIsExpense(true);
            setDate(currentDate);
            setDescription("");
        }
    }, [transaction]);

    const closeHandler = () => {
        setShow(false);
        onClose?.(false);
    };

    async function fetchCategories() {
        try {
            const response = await api.get(`/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    }

    const ensureCategoryExists = async (label: string) => {
        if (categories.find((c) => c.categoryLabel === label)) {
            return label;
        }

        try {
            const resp = await api.post("/categories", { categoryLabel: label });

            return resp.data.categoryLabel ?? label;
        } catch (err: any) {
            if (err?.response?.status === 409) {
                await fetchCategories();
                return label;
            }
            throw err;
        }
    };

    const createTransaction = async (payload: TransactionPayload) => {
        const resp = await api.post("/transactions", payload);
        return resp.data;
    };

    const updateTransaction = async (transactionId: number, payload: TransactionPayload) => {
        const resp = await api.put(`/transactions/${transactionId}`, payload);
        return resp.data;
    };

    const deleteTransaction = async (transactionId: number) => {
        await api.delete(`/transactions/${transactionId}`);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const categoryLabel = categoryValue;
        const payload: TransactionPayload = {
            categoryLabel,
            amount: Number(amount),
            date: date,
            description: description,
            isExpense: isExpense,
        };

        const isUpdating = Boolean(transaction);

        try {
            await ensureCategoryExists(categoryLabel);

            if (isUpdating && transaction) {
                await updateTransaction(transaction.transactionId, payload);
            } else {
                await createTransaction(payload);
            }

            setAmount("");
            setCategoryValue("");
            setDate("");
            setDescription("");
            closeHandler();

        } catch (err) {
            console.error("Transaction error", err);
            setError("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (categoryId: number) => {
        try {
            await api.delete(`/categories/${categoryId}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setShow(showProp);
        setDate(currentDate);
    }, [showProp]);

    return (
        <div style={{
            visibility: show ? "visible" : "hidden",
            opacity: show ? "1" : "0"
        }}
            className="transition-opacity duration-300 fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => { closeHandler(); console.log("clicked"); }}
        >

            <div className="flex w-full h-full gap-2 items-center justify-center px-4 md:px-0">

                <div className="w-full h-2/3 max-w-lg bg-stone-700 rounded-md shadow-lg p-6 relative flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="absolute top-4 right-4 cursor-pointer" onClick={closeHandler}>
                        <X className="w-6 h-6 text-white" />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        <h2 className="text-2xl font-semibold text-white mb-4">{transaction ? "Modifier la transaction" : "Nouvelle Transaction"}</h2>

                        <div className="relative">
                            <label className="block text-white mb-2">Montant :</label>
                            <div className="relative">
                                <input type="number" className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={amount} onChange={(e) => {
                                    setAmount(e.target.value === "" ? "" : parseFloat(e.target.value));
                                }} required />
                                <span className="absolute right-3 top-30/100 text-gray-200">€</span>
                            </div>
                            <div className="flex flex-row gap-4 mt-2">
                                <button type="button" onClick={() => setIsExpense(true)} className={`w-full py-2 text-white border border-red-900 rounded-md ${isExpense ? "bg-red-800" : "bg-red-800/10 hover:bg-red-600/33 cursor-pointer"}`}>Dépense</button>
                                <button type="button" onClick={() => setIsExpense(false)} className={`w-full py-2 text-white border border-green-900 rounded-md ${!isExpense ? "bg-green-800" : "bg-green-800/10 hover:bg-green-600/33 cursor-pointer"} `}>Revenu</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white mb-2">Catégorie :</label>
                            <AutocompleteFreeText
                                options={categories.map(c => ({ id: c.categoryId, label: c.categoryLabel }))}
                                value={categoryValue}
                                onChange={setCategoryValue}
                                onSelect={(option) => {
                                    setCategoryValue(option);
                                }}
                                onDelete={(id) => {
                                    deleteCategory(id);
                                }}
                                placeholder="Sélectionnez ou entrez une catégorie"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-2">Date :</label>
                            <input type="date" className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>

                        <div>
                            <label className="block text-white mb-2">Description :</label>
                            <textarea className="w-full min-w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>


                        <div className="mt-4 flex flex-col md:flex-row gap-2">
                            <button type="submit" className="w-full bg-gradient-to-r from-gray-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-teal-500/30">{transaction ? "Modifier" : "Ajouter"}</button>

                            {transaction && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (transaction && transaction.transactionId) {
                                            deleteTransaction(transaction.transactionId);
                                            onClose?.(false);
                                        }
                                    }}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-800 transition-all cursor-pointer shadow-lg shadow-red-500/30"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default NewTransactionPopup;
