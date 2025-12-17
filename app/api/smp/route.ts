import { NextRequest, NextResponse } from "next/server";
import type { DailySMPData } from "@/types";

/**
 * 공공데이터포털 API 응답을 DailySMPData 형식으로 변환
 * 데이터가 없어도 빈 배열로 반환 (null 반환 안 함)
 */
function transformAPIResponse(data: unknown, date: string): DailySMPData {
  try {
    console.log(`[${date}] transformAPIResponse 시작`);
    
    const response = extractResponse(data);
    if (response === null) {
      console.warn(`[${date}] response 객체를 찾을 수 없습니다. data 구조:`, data ? Object.keys(data) : "null");
      // response가 없어도 빈 데이터로 반환 (에러가 아님)
      return {
        date: formatDateString(date),
        hourlyPrices: new Array(24).fill(0),
      };
    }

    console.log(`[${date}] response 객체 추출 성공, header 존재:`, !!response.header, "body 존재:", !!response.body);

    checkResponseHeader(response);

    const items = extractItems(response);
    if (!items || items.length === 0) {
      console.warn(`[${date}] items를 찾을 수 없거나 비어있습니다. response.body 구조:`, response.body ? Object.keys(response.body) : "null");
      // 데이터가 없어도 빈 배열로 반환 (에러가 아님)
      return {
        date: formatDateString(date),
        hourlyPrices: new Array(24).fill(0),
      };
    }

    console.log(`[${date}] API 응답 items 수:`, items.length);
    if (items.length > 0) {
      console.log(`[${date}] 첫 번째 item 샘플:`, JSON.stringify(items[0], null, 2).substring(0, 500));
    }

    const hourlyPrices = extractHourlyPrices(items);
    const formattedDate = formatDateString(date);

    const hasData = hourlyPrices.some((price) => price > 0);
    if (hasData) {
      console.log(`[${date}] 유효한 SMP 데이터 ${hourlyPrices.filter(p => p > 0).length}개 발견`);
    } else {
      console.warn(`[${date}] 유효한 SMP 데이터가 없습니다. (모든 값이 0)`);
      // 데이터가 없어도 빈 배열로 반환 (에러가 아님)
    }

    return {
      date: formattedDate,
      hourlyPrices,
    };
  } catch (error) {
    console.error(`[${date}] API 응답 변환 오류:`, error);
    throw error;
  }
}

function extractResponse(data: unknown): { header?: unknown; body?: unknown } | null {
  if (typeof data === "object" && data !== null && "response" in data) {
    const response = (data as { response: unknown }).response;
    if (typeof response === "object" && response !== null) {
      return response as { header?: unknown; body?: unknown };
    }
  }
  return null;
}

function checkResponseHeader(response: { header?: unknown }): void {
  if (!response.header) {
    return;
  }

  const header = response.header;
  if (
    typeof header === "object" &&
    header !== null &&
    "resultCode" in header
  ) {
    const resultCode = (header as { resultCode: string }).resultCode;
    if (resultCode !== "00") {
      const resultMsg = (header as { resultMsg?: string }).resultMsg || "알 수 없는 오류";
      throw new Error(`API 오류 (코드: ${resultCode}): ${resultMsg}`);
    }
  }
}

function extractItems(response: { body?: unknown }): unknown[] | null {
  if (!response.body) {
    console.warn("response.body가 없습니다.");
    return null;
  }

  const body = response.body;
  if (typeof body !== "object" || body === null) {
    console.warn("body가 객체가 아닙니다:", typeof body);
    return null;
  }

  if (!("items" in body)) {
    console.warn("body에 items 속성이 없습니다. body 키:", Object.keys(body));
    return null;
  }

  const items = (body as { items: unknown }).items;
  if (typeof items !== "object" || items === null) {
    console.warn("items가 객체가 아닙니다:", typeof items);
    return null;
  }

  if (!("item" in items)) {
    console.warn("items에 item 속성이 없습니다. items 키:", Object.keys(items));
    return null;
  }

  const itemArray = (items as { item: unknown }).item;
  const result = Array.isArray(itemArray) ? itemArray : [itemArray];
  console.log(`extractItems: ${result.length}개 항목 추출`);
  return result;
}

function extractHourlyPrices(items: unknown[]): number[] {
  const hourlyPrices: number[] = new Array(24).fill(0);
  let processedCount = 0;

  items.forEach((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      const typedItem = item as Record<string, unknown>;
      
      const areaName = typedItem.areaName;
      if (areaName !== "육지") {
        return;
      }
      
      const hour = getHourFromItem(typedItem);
      const smpPrice = getSMPPriceFromItem(typedItem);

      if (hour >= 1 && hour <= 24 && typeof smpPrice === "number" && smpPrice > 0) {
        hourlyPrices[hour - 1] = smpPrice;
        processedCount++;
      }
    }
  });

  if (processedCount === 0) {
    console.warn("육지 지역의 SMP 데이터를 찾을 수 없습니다.");
  } else {
    console.log(`육지 지역 SMP 데이터 ${processedCount}개 처리 완료`);
  }

  return hourlyPrices;
}

function getHourFromItem(item: Record<string, unknown>): number {
  if ("hour" in item) {
    const value = item.hour;
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return 0;
}

function getSMPPriceFromItem(item: Record<string, unknown>): number | null {
  if ("smp" in item) {
    const value = item.smp;
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function formatDateString(dateStr: string): string {
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  }
  return dateStr;
}

/**
 * GET /api/smp?date=YYYYMMDD
 * 공공데이터포털 API를 서버 사이드에서 호출하여 CORS 문제 해결
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "date 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    // 서버 사이드에서는 NEXT_PUBLIC_ 접두사 없이도 접근 가능
    // 하지만 기존 환경 변수와의 호환성을 위해 둘 다 확인
    const serviceKey = 
      process.env.DATA_GO_KR_SERVICE_KEY || 
      process.env.NEXT_PUBLIC_DATA_GO_KR_SERVICE_KEY;

    if (!serviceKey) {
      return NextResponse.json(
        { error: "공공데이터포털 서비스 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const baseUrl = "https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand";
    const params = new URLSearchParams({
      serviceKey: serviceKey,
      pageNo: "1",
      numOfRows: "48",
      dataType: "json",
      date: date,
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API 호출 실패: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 디버깅: API 응답 구조 확인
    console.log(`[${date}] API 응답 구조 (처음 1000자):`, JSON.stringify(data, null, 2).substring(0, 1000));
    
    try {
      const result = transformAPIResponse(data, date);
      // transformAPIResponse는 이제 항상 DailySMPData를 반환 (null 아님)
      return NextResponse.json(result);
    } catch (transformError) {
      // 변환 중 예외 발생 시 상세 정보와 함께 에러 반환
      const errorDetails = {
        message: transformError instanceof Error ? transformError.message : "알 수 없는 변환 오류",
        date: date,
        hasResponse: typeof data === "object" && data !== null && "response" in data,
        responseStructure: typeof data === "object" && data !== null ? Object.keys(data) : [],
        rawDataSample: JSON.stringify(data, null, 2).substring(0, 500),
      };
      console.error(`[${date}] 데이터 변환 실패:`, errorDetails);
      return NextResponse.json(
        { 
          error: "데이터를 변환할 수 없습니다.", 
          details: errorDetails 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("SMP API Route 오류:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}
