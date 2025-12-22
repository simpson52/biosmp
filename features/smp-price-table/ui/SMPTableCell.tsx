import { cn } from "@/lib/utils";

interface SMPTableCellProps {
  price: number;
  curtailmentThreshold: number;
  isWeekend: boolean;
  readOnly: boolean;
  onPriceChange?: (newPrice: number) => void;
}

export function SMPTableCell({
  price,
  curtailmentThreshold,
  isWeekend,
  readOnly,
  onPriceChange,
}: SMPTableCellProps) {
  const isCurtailment = price >= curtailmentThreshold;
  const isNegative = price < 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !onPriceChange) return;
    const newValue = Number.parseFloat(e.target.value);
    if (!Number.isNaN(newValue)) {
      onPriceChange(newValue);
    }
  };

  if (readOnly) {
    return (
      <td
        className={cn(
          "w-[36px] h-12 px-2 text-center border-r border-gray-100 last:border-r-0",
          isCurtailment && "bg-[#FEE2E2]",
          isNegative && "text-[#F04452]",
          isWeekend && !isCurtailment && !isNegative && "bg-[#F9FAFB]"
        )}
      >
        <span className="text-[14px] font-medium text-[#191F28] tracking-[-0.02em]">
          {price.toLocaleString("ko-KR")}
        </span>
      </td>
    );
  }

  return (
    <td
      className={cn(
        "w-[36px] h-12 px-2 text-center border-r border-gray-100 last:border-r-0",
        isCurtailment && "bg-[#FEE2E2]",
        isWeekend && !isCurtailment && "bg-[#F9FAFB]"
      )}
    >
      <input
        type="number"
        value={price}
        onChange={handleChange}
        className={cn(
          "w-full h-full text-center text-[14px] font-medium bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 rounded",
          isNegative && "text-[#F04452]",
          "tracking-[-0.02em]"
        )}
      />
    </td>
  );
}

