import { cn } from "@/lib/utils";
import type { AutocompleteOption } from "../types";

interface AutocompleteDropdownProps {
  show: boolean;
  options: AutocompleteOption[];
  selectedIndex: number;
  onSelect: (option: AutocompleteOption) => void;
  autocompleteRef: React.RefObject<HTMLDivElement>;
}

export function AutocompleteDropdown({
  show,
  options,
  selectedIndex,
  onSelect,
  autocompleteRef,
}: AutocompleteDropdownProps) {
  if (!show) return null;

  return (
    <div
      ref={autocompleteRef}
      className="absolute z-50 w-full max-w-md bg-white rounded-[24px] shadow-lg max-h-[300px] overflow-y-auto mt-2"
      style={{
        top: "100%",
        left: 0,
      }}
    >
      {options.length > 0 ? (
        <div className="p-2">
          {options.map((option, index) => (
            <button
              key={option.code}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "w-full text-left p-4 rounded-[16px] transition-all active:scale-[0.96]",
                index === selectedIndex
                  ? "bg-[#E8F3FF]"
                  : "hover:bg-[#F9FAFB]"
              )}
            >
              <div className="font-bold text-[17px] text-[#191F28] tracking-[-0.02em]">
                {option.label}
              </div>
              <div className="text-[14px] text-[#8B95A1] mt-1 tracking-[-0.02em]">
                {option.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-[14px] text-[#8B95A1] tracking-[-0.02em]">
          일치하는 변수가 없습니다
        </div>
      )}
    </div>
  );
}

