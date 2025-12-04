import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { X } from "lucide-react";
import AutocompleteFreeText from "../AutoCompleteInput";

interface NewBudgetPopupProps {
    show?: boolean;
    onClose?: (open: boolean) => void;
    month?: number;
    year?: number;
}

const NewBudgetPopup: React.FC<NewBudgetPopupProps> = (props) => {
    const [show, setShow] = useState(false);
    const [categories, setCategories] = useState<Array<{ categoryId: number; categoryLabel: string }>>([]);
    const [categoryValue, setCategoryValue] = useState<string>("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number | "">("");
    const [extendMonth, setExtendMonth] = useState<number>(0);
    const { userId } = useAuth();

    const API_URL = (import.meta as any).env.VITE_API_URL;

    const closeHandler = (e: React.MouseEvent) => {
        setShow(false);
        props.onClose?.(false);
    };

    async function fetchCategories() {
        try {
            const response = await axios.get(`${API_URL}/categories/${userId}`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategoryId = categoryId;
        const budgetAmount = amount;
        const budgetExtendMonth = extendMonth;

        if (categories.find(cat => cat.categoryId === selectedCategoryId) === undefined) {
            alert("Veuillez sélectionner une catégorie valide.");
            return;
        }

        axios
            .post(`${API_URL}/budget`, {
                userId,
                categoryId: selectedCategoryId,
                amount: budgetAmount,
                month: props.month,
                year: props.year,
                extendMonth: budgetExtendMonth,
            })
            .then((res) => {
                console.log("Transaction added:", res.data);
                setAmount("");
                setCategoryId(null);
                setExtendMonth(0);
                closeHandler(new MouseEvent("click") as unknown as React.MouseEvent);
            })
            .catch((err) => {
                console.error("Error adding transaction", err);
            });
    };


    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setShow(Boolean(props.show));
    }, [props.show]);

    return (
        <div style={{
            visibility: show ? "visible" : "hidden",
            opacity: show ? "1" : "0"
        }} className="transition-opacity duration-300 fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="flex w-full h-full gap-2 items-center justify-center px-4 md:px-0">

                <div className="w-full h-2/3 max-w-lg bg-stone-700 rounded-md shadow-lg p-6 relative flex flex-col overflow-y-auto">
                    <div className="absolute top-4 right-4 cursor-pointer" onClick={closeHandler}>
                        <X className="w-6 h-6 text-white" />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-95/100 w-full">
                        <h2 className="text-2xl font-semibold text-white mb-4">Nouveau Budget</h2>

                        <div className="relative">
                            <label className="block text-white mb-2">Montant :</label>
                            <div className="relative">
                                <input type="number" className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={amount} onChange={(e) => {
                                    setAmount(e.target.value === "" ? "" : parseFloat(e.target.value));
                                }} required />
                                <span className="absolute right-3 top-20/100 text-gray-200">€</span>
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
                                    setCategoryId(option ? categories.find(c => c.categoryLabel === option)?.categoryId || null : null);
                                }}
                                placeholder="Sélectionnez ou entrez une catégorie"
                                className="w-full"
                            />
                        </div>

                        <div className="block text-white mb-2">
                            Étendre le budget pendant <input type="number" className="w-16 ml-2 mr-2 rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={extendMonth} onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setExtendMonth(isNaN(val) ? 0 : val);
                            }} /> mois.
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-gray-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30">Ajouter</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

NewBudgetPopup.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func
};
export default NewBudgetPopup;