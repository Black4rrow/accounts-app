import { useEffect, useRef, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { RecurringTransaction } from "../utils/Types";
import { Trash2 } from "lucide-react";
import NewRecurringTransactionPopup from "./popups/NewReccuringTransactionPopup";

interface RecurringTransactionsProps {
  className?: string;
}

export default function RecurringTransactions(props: RecurringTransactionsProps) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<RecurringTransaction | null>(null);

  const { userId } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchTokenRef = useRef<number>(0);

  const bumpFetchToken = () => fetchTokenRef.current++;

  /** --- Fetch all recurring transactions --- */
  const fetchRecurringTransactions = async (force = false) => {
    if (!force && isFetching) return;
    setIsFetching(true);
    const tokenAtCall = fetchTokenRef.current;

    try {
      const res = await api.get(`/recurring`);
      if (tokenAtCall !== fetchTokenRef.current) return;

      setRecurringTransactions(res.data);
    } catch (err) {
      console.error("Error fetching recurring transactions", err);
    } finally {
      setIsFetching(false);
    }
  };

  /** --- Delete a recurring transaction --- */
  const deleteRecurringTransaction = async (id: number) => {
    try {
      await api.delete(`/recurring/${id}`);
      bumpFetchToken();
      fetchRecurringTransactions(true);
    } catch (err) {
      console.error("Error deleting recurring transaction", err);
    }
  };

  /** --- Toggle active state directly --- */
  const toggleActive = async (transaction: RecurringTransaction) => {
    try {
      await api.put(`/recurring/${transaction.id}`, {
        ...transaction,
        active: !transaction.active
      });
      setRecurringTransactions(prev =>
        prev.map(t => (t.id === transaction.id ? { ...t, active: !t.active } : t))
      );
    } catch (err) {
      console.error("Error toggling recurring transaction", err);
    }
  };

  const openEditPopup = (transaction: RecurringTransaction) => {
    setTransactionToEdit(transaction);
    setShowPopup(true);
  };

  const closePopup = (open: boolean) => {
    setShowPopup(open);
    if (!open) {
      setTransactionToEdit(null);
      bumpFetchToken();
      fetchRecurringTransactions(true);
    }
  };

  useEffect(() => {
    fetchRecurringTransactions(true);
  }, []);

  return (
    <div className={props.className}>
      <NewRecurringTransactionPopup
        onClose={closePopup}
        show={showPopup}
        transaction={transactionToEdit || undefined}
      />

      <h2 className="text-white text-2xl mb-4">Transactions récurrentes</h2>

      <div className="w-full flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-20 bg-stone-800 border-b border-stone-700">
          <div className="grid grid-cols-12 items-center">
            <div className="col-span-2 p-3 text-left font-semibold text-white text-sm">Jour</div>
            <div className="col-span-3 p-3 text-left font-semibold text-white text-sm">Heure</div>
            <div className="col-span-3 p-3 text-left font-semibold text-white text-sm">Catégorie</div>
            <div className="col-span-2 p-3 text-right font-semibold text-white text-sm">Montant</div>
            <div className="col-span-2 p-3 text-center font-semibold text-white text-sm">Actif</div>
          </div>
        </div>

        <div ref={scrollRef} className="overflow-y-auto custom-scroll">
          <ul className="divide-y divide-stone-700">
            {recurringTransactions.map(transaction => (
              <li
                key={transaction.id}
                className="group relative grid grid-cols-12 items-center h-16 cursor-pointer hover:bg-stone-700"
                onClick={() => openEditPopup(transaction)}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteRecurringTransaction(transaction.id); }}
                  aria-label="Supprimer"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-200/90 sm:bg-none p-2 sm:p-1 rounded-md hover:bg-red-600/75 z-20 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-800 sm:text-red-600" />
                </button>

                {/* Day of month */}
                <div className="col-span-2 px-3 text-white">{transaction.dayOfMonth}</div>

                {/* Time */}
                <div className="col-span-3 px-3 text-white">{transaction.timeOfDay}</div>

                {/* Category */}
                <div className="col-span-3 px-3 text-white">{transaction.categoryLabel}</div>

                {/* Amount */}
                <div className="col-span-2 px-3 flex justify-end">
                  <span className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount}€
                  </span>
                </div>

                {/* Active toggle */}
                <div className="col-span-2 flex justify-center">
                  <input
                    type="checkbox"
                    checked={transaction.active}
                    onChange={(e) => { e.stopPropagation(); toggleActive(transaction); }}
                    className="w-5 h-5 accent-teal-500"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add new button */}
      <div className="w-full flex justify-center mt-4">
        <button
          className="w-full max-w-sm rounded-md bg-slate-700 text-white px-6 py-3 hover:bg-slate-600 transition-colors"
          onClick={() => setShowPopup(true)}
        >
          Ajouter une transaction récurrente
        </button>
      </div>
    </div>
  );
}
