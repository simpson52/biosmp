export function SMPTableHeader() {
  return (
    <thead>
      <tr className="bg-[#F9FAFB] border-b border-gray-100">
        <th className="bg-[#F9FAFB] w-[70px] h-12 px-3 font-bold text-[14px] text-[#191F28] text-center border-r border-gray-100 tracking-[-0.02em]">
          날짜/시간
        </th>
        {Array.from({ length: 24 }, (_, i) => i + 1).map((hour) => (
          <th
            key={hour}
            className="w-[36px] h-12 px-2 font-bold text-[14px] text-[#191F28] text-center border-r border-gray-100 last:border-r-0 tracking-[-0.02em]"
          >
            {hour}
          </th>
        ))}
      </tr>
    </thead>
  );
}

