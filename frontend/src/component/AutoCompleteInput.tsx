import React, { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

type Opt = { id: number; label: string };

interface AutocompleteFreeTextProps {
    options: Opt[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    onSelect?: (option: string) => void;
    onDelete?: (option: number) => void;
    className?: string;
    maxSuggestions?: number;
}

export default function AutocompleteFreeText({
    options,
    value,
    placeholder,
    onChange,
    onSelect,
    onDelete,
    className = "",
    maxSuggestions = 8,
}: AutocompleteFreeTextProps) {
    const [inputValue, setInputValue] = useState(value ?? "");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);


    useEffect(() => {
        if (typeof value === "string" && value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    const filtered = options
        .filter((o: Opt) => o.label.toLowerCase().includes((inputValue ?? "").toLowerCase().trim()))
        .slice(0, maxSuggestions);

    useEffect(() => {
        if (filtered.length > 0 && inputRef.current === document.activeElement) {
            setIsOpen(true);
        } else if (filtered.length === 0) {
            setIsOpen(false);
        }
    }, [filtered]);

    const handleInputChange = (v: string) => {
        setInputValue(v);
        setHighlightIndex(-1);
        onChange?.(v);
        if (v.length > 0 && filtered.length > 0) setIsOpen(true);
    };

    const selectOption = (option: string) => {
        setInputValue(option);
        setIsOpen(false);
        setHighlightIndex(-1);
        onChange?.(option);
        onSelect?.(option);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            if (filtered.length > 0) setIsOpen(true);
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < filtered.length - 1 ? prev + 1 : 0
            );
            scrollHighlightedIntoView();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : filtered.length - 1
            );
            scrollHighlightedIntoView();
        } else if (e.key === "Enter") {
            if (highlightIndex >= 0 && highlightIndex < filtered.length) {
                e.preventDefault();
                selectOption(filtered[highlightIndex].label);
            } else {
                onChange?.(inputValue);
                setIsOpen(false);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const scrollHighlightedIntoView = () => {
        if (!listRef.current) return;
        const children = Array.from(listRef.current.children) as HTMLElement[];
        if (highlightIndex >= 0 && highlightIndex < children.length) {
            children[highlightIndex].scrollIntoView({ block: "nearest" });
        }
    };

    return (
        <div className={`relative w-full ${className}`}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                placeholder={placeholder}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => {
                    if (filtered.length > 0) setIsOpen(true);
                }}
                onBlur={() => {
                    setTimeout(() => {
                        setIsOpen(false);
                        setHighlightIndex(-1);
                    }, 100);
                }}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border border-gray-700 bg-stone-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-200"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="autocomplete-listbox"
                aria-activedescendant={
                    highlightIndex >= 0 ? `autocomplete-item-${highlightIndex}` : undefined
                }
            />

            {isOpen && filtered.length > 0 && (
                <ul
                    id="autocomplete-listbox"
                    ref={listRef}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-700 bg-stone-800 py-1 shadow-lg"
                >
                    {filtered.map((opt, idx) => {
                        const isHighlighted = idx === highlightIndex;
                        return (
                            <li
                                id={`autocomplete-item-${idx}`}
                                key={opt.id}
                                role="option"
                                aria-selected={isHighlighted}
                                onMouseDown={(e) => {
                                    selectOption(opt.label);
                                }}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                className={`group relative cursor-pointer px-3 py-2 text-sm ${isHighlighted
                                    ? "bg-slate-600 text-white"
                                    : "text-gray-200 hover:bg-gray-700"
                                    }`}
                            >
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDelete?.(opt.id);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 rounded-md cursor-pointer">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                                {opt.label}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}