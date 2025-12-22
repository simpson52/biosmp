import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AnalysisTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-[#F9FAFB] border-b border-gray-100">
        <TableHead className="sticky left-0 z-10 bg-[#F9FAFB] min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] tracking-[-0.02em] whitespace-nowrap">
          출력 레벨
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 bg-[#FFF9E6] tracking-[-0.02em] whitespace-nowrap">
          공헌이익<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원/일)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center bg-[#E8F3FF] tracking-[-0.02em] whitespace-nowrap">
          시간당 수익<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(만원/h)</span>
        </TableHead>
        <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          송전량<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(MWh/h)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          발전효율<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
        </TableHead>
        <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          송전효율<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          소내소비율<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          WC 혼소율<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(%)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
          발전단가<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          약품비<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          수전요금<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(원/kWh)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
          매출 전력량<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          매출 REC<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="min-w-[80px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center bg-[#E8F3FF] tracking-[-0.02em] whitespace-nowrap">
          매출 계<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="min-w-[90px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-l border-gray-100 tracking-[-0.02em] whitespace-nowrap">
          연료사용량<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(톤/일)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          연료비<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          약품비<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="min-w-[75px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center tracking-[-0.02em] whitespace-nowrap">
          수전료<br />
          <span className="text-[12px] font-normal text-[#8B95A1]">(백만원)</span>
        </TableHead>
        <TableHead className="w-[80px] font-bold text-[14px] text-[#191F28] text-center">
          상세
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
