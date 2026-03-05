import React, { useEffect, useState } from "react";
import api from "../../api";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AutocompleteFreeText from "../AutoCompleteInput";
import { RecurringTransaction } from "../../utils/Types";

interface NewRecurringTransactionPopupProps {
  show?: boolean;
  onClose?: (open: boolean) => void;
  transaction?: RecurringTransaction;
}

interface RecurringTransactionPayload {
  categoryLabel: string;
  amount: number;
  dayOfMonth: number;
  timeOfDay: string;
  timezone: string;
  description?: string;
  isExpense: boolean;
}

const NewRecurringTransactionPopup: React.FC<NewRecurringTransactionPopupProps> = ({ show: showProp, onClose, transaction }) => {
  const currentDate = new Date();
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState<Array<{ categoryId: number; categoryLabel: string }>>([]);
  const [categoryValue, setCategoryValue] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [isExpense, setIsExpense] = useState<boolean>(true);
  const [dayOfMonth, setDayOfMonth] = useState<number>(currentDate.getDate());
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId } = useAuth();
  const API_URL = (import.meta as any).env.VITE_API_URL;

  useEffect(() => {
    if (transaction) {
      setCategoryValue(transaction.categoryLabel);
      setAmount(Math.abs(transaction.amount));
      setDayOfMonth(transaction.dayOfMonth);
      setTimeOfDay(transaction.timeOfDay ?? "09:00");
      setTimezone(transaction.timezone);
      setDescription(transaction.description ?? "");
      setIsExpense(transaction.amount < 0);
    } else {
      setCategoryValue("");
      setAmount("");
      setDayOfMonth(currentDate.getDate());
      setTimeOfDay("09:00");
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setDescription("");
      setIsExpense(true);
    }
  }, [transaction]);

  useEffect(() => {
    setShow(Boolean(showProp));
  }, [showProp]);

  async function fetchCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  }

  const ensureCategoryExists = async (label: string) => {
    if (categories.find(c => c.categoryLabel === label)) return label;

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

  const createRecurringTransaction = async (payload: RecurringTransactionPayload) => {
    const resp = await api.post("/recurring", payload);
    return resp.data;
  };

  const updateRecurringTransaction = async (id: number, payload: RecurringTransactionPayload) => {
    const resp = await api.put(`/recurring/${id}`, payload);
    return resp.data;
  };

  const deleteRecurringTransaction = async (id: number) => {
    await api.delete(`/recurring/${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ensureCategoryExists(categoryValue);

      const payload: RecurringTransactionPayload = {
        categoryLabel: categoryValue,
        amount: Number(amount),
        dayOfMonth,
        timeOfDay,
        timezone,
        description: description || undefined,
        isExpense,
      };

      if (transaction) {
        await updateRecurringTransaction(transaction.id, payload);
      } else {
        await createRecurringTransaction(payload);
      }

      closeHandler();
    } catch (err) {
      console.error("Error saving recurring transaction", err);
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const closeHandler = () => {
    setShow(false);
    onClose?.(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div
      style={{
        visibility: show ? "visible" : "hidden",
        opacity: show ? "1" : "0",
      }}
      className="transition-opacity duration-300 fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => {closeHandler();}}
    >
      <div className="flex w-full h-full gap-2 items-center justify-center px-4 md:px-0">
        <div className="w-full h-2/3 max-w-lg bg-stone-700 rounded-md shadow-lg p-6 relative flex flex-col overflow-y-auto"  onClick={(e) => e.stopPropagation()}>

          <div className="absolute top-4 right-4 cursor-pointer" onClick={closeHandler}>
            <X className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">{transaction ? "Modifier transaction récurrente" : "Nouvelle transaction récurrente"}</h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-white mb-1">Montant</label>
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
              <label className="block text-white mb-1">Catégorie</label>
              <AutocompleteFreeText
                options={categories.map(c => ({ id: c.categoryId, label: c.categoryLabel }))}
                value={categoryValue}
                onChange={setCategoryValue}
                placeholder="Sélectionnez ou entrez une catégorie"
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-white mb-1">Jour du mois</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                  className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-white mb-1">Heure</label>
                <input
                  type="time"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-1">Fuseau horaire</label>
              <AutocompleteFreeText
                options={Intl.supportedValuesOf("timeZone").map(tz => ({ id: tz, label: tz }))}
                value={timezone}
                onChange={setTimezone}
                placeholder="Sélectionnez ou entrez un fuseau horaire"
                className="w-full mt-1"
              />
            </div>

            <div>
              <label className="block text-white mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>

            {error && <p className="text-red-400">{error}</p>}

            <div className="mt-4 flex flex-col md:flex-row gap-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-teal-500/30"
              >
                {transaction ? "Modifier" : "Ajouter"}
              </button>

              {transaction && (
                <button
                  type="button"
                  onClick={() => {
                    if (transaction && transaction.id) {
                      deleteRecurringTransaction(transaction.id);
                      onClose?.(false);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-3 rounded-lg hover:from-red-600 hover:to-red-800 transition-all cursor-pointer shadow-lg shadow-red-500/30"
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

export default NewRecurringTransactionPopup;
