"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  id: string;
  label: string;
}

interface HeroSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

export function HeroSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  size = "sm",
}: HeroSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex flex-col w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 ${
          size === "sm" ? "h-10 text-xs" : "h-11 text-sm"
        } font-bold rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 hover:border-zinc-400 transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-zinc-950/20 ${
          isOpen ? "border-zinc-950 shadow-md ring-2 ring-zinc-950/10 bg-white" : ""
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-zinc-950" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-2xl bg-white/98 backdrop-blur-xl border border-zinc-200 p-1.5 shadow-2xl shadow-black/10 animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
