interface PreviewCardProps {
  result: number | null;
  fieldUnit: string;
  inputHeight?: number;
}

export function PreviewCard({ result, fieldUnit, inputHeight = 48 }: PreviewCardProps) {
  return (
    <div className="flex h-full min-w-0">
      <div 
        data-preview-card
        className="w-full rounded-[16px] bg-[#F9FAFB] px-4 py-4 flex flex-col justify-center items-center min-w-0"
        style={{
          height: `${inputHeight}px`,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: "1.5",
          color: "#191F28",
        }}
      >
        {result !== null ? (
          <div className="flex items-baseline gap-1.5 justify-center flex-wrap min-w-0 w-full">
            <span className="text-[17px] font-medium text-[#191F28] leading-tight tracking-[-0.02em] break-words">
              {typeof result === "number" 
                ? result.toLocaleString("ko-KR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : result}
            </span>
            {fieldUnit && (
              <span className="text-[14px] text-[#8B95A1] font-medium tracking-[-0.02em] whitespace-nowrap">
                {fieldUnit}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[17px] text-[#F04452] font-medium tracking-[-0.02em] break-words text-center">
            계산식 오류
          </p>
        )}
      </div>
    </div>
  );
}

