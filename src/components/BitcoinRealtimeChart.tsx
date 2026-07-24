import React, {useEffect, useRef, useState} from "react";
import { CandlestickSeries,
  ColorType,
  createChart,
  LineSeries,
  Time,
} from "lightweight-charts";

interface Props {
  market?: string;
  unit?: 1 | 3 | 5 | 10 | 15 | 30 | 60 | 240;
  title?: string;
  height?: number;
}

type CandleRow = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

const toChartTime = (kstDateTime: string): Time => {
  // 예: "2025-01-02T13:28:05" -> unix seconds
  return Math.floor(new Date(`${kstDateTime}+09:00`).getTime() / 1000) as Time;
};

const toCandleRow = (item: any): CandleRow => ({
  time: toChartTime(item.candle_date_time_kst),
  open: Number(item.opening_price),
  high: Number(item.high_price),
  low: Number(item.low_price),
  close: Number(item.trade_price),
  volume: Number(item.candle_acc_trade_volume ?? 0),
});

const buildMA = (rows: CandleRow[], period = 20) => {
  const result: {time: Time; value: number}[] = [];

  for (let i = period - 1; i < rows.length; i += 1) {
    const slice = rows.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, row) => sum + row.close, 0) / period;

    result.push({
      time: rows[i].time,
      value: Number(avg.toFixed(2)),
    });
  }

  return result;
};

const parseWsMessage = async (data: any) => {
  if (typeof data === "string") {
    return JSON.parse(data);
  }

  if (data instanceof Blob) {
    const text = await data.text();
    return JSON.parse(text);
  }

  if (data instanceof ArrayBuffer) {
    const text = new TextDecoder("utf-8").decode(data);
    return JSON.parse(text);
  }

  return null;
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  padding: 16,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#ffffff",
  boxSizing: "border-box",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const titleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};

const badgeStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: 12,
  borderRadius: 9999,
  background: "#f3f4f6",
  color: "#374151",
};

const priceStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 12,
  fontSize: 24,
  fontWeight: 700,
  color: "#111827",
};

const chartWrapStyle: React.CSSProperties = {
  width: "100%",
  position: "relative",
};

const chartBoxStyle: React.CSSProperties = {
  width: "100%",
};

export default function BitcoinRealtimeChart({
                                               market = "KRW-BTC",
                                               unit = 1,
                                               title = "실시간 비트코인 차트",
                                               height = 520,
                                             }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const maSeriesRef = useRef<any>(null);
  const candleDataRef = useRef<CandleRow[]>([]);

  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("초기화 중...");

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: {type: ColorType.Solid, color: "#ffffff"},
        textColor: "#374151",
      },
      grid: {
        vertLines: {color: "#f3f4f6"},
        horzLines: {color: "#f3f4f6"},
      },
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
      timeScale: {
        borderColor: "#e5e7eb",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
      priceLineVisible: true,
      lastValueVisible: true,
    });

    const maSeries = chart.addSeries(LineSeries, {
      color: "#111827",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    maSeriesRef.current = maSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartRef.current) return;

      chartRef.current.applyOptions({
        width: entry.contentRect.width,
        height,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      maSeriesRef.current = null;
    };
  }, [height]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let pingTimer: number | null = null;
    let cancelled = false;

    const applyAllData = (rows: CandleRow[]) => {
      candleDataRef.current = rows;
      candleSeriesRef.current?.setData(rows);
      maSeriesRef.current?.setData(buildMA(rows, 20));
      chartRef.current?.timeScale().fitContent();

      const last = rows[rows.length - 1];
      if (last) {
        setLastPrice(last.close);
      }
    };

    const upsertLiveCandle = (nextRow: CandleRow) => {
      const rows = [...candleDataRef.current];
      const last = rows[rows.length - 1];

      if (last && last.time === nextRow.time) {
        rows[rows.length - 1] = nextRow;
      } else {
        rows.push(nextRow);
      }

      candleDataRef.current = rows;
      candleSeriesRef.current?.update(nextRow);
      maSeriesRef.current?.setData(buildMA(rows, 20));
      setLastPrice(nextRow.close);
    };

    const connectWebSocket = () => {
      setStatus("실시간 연결 중...");

      ws = new WebSocket("wss://api.upbit.com/websocket/v1");

      ws.onopen = () => {
        const payload = [
          {ticket: `srs-${Date.now()}`},
          {type: `candle.${unit}m`, codes: [market]},
          {format: "DEFAULT"},
        ];

        ws?.send(JSON.stringify(payload));
        setStatus("실시간 수신 중");

        pingTimer = window.setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send("PING");
          }
        }, 30000);
      };

      ws.onmessage = async (event) => {
        try {
          const parsed = await parseWsMessage(event.data);
          if (!parsed) return;

          // 업비트 상태 메시지 {"status":"UP"} 대응
          if (parsed.status === "UP") return;

          if (!parsed.candle_date_time_kst) return;

          const nextRow = toCandleRow(parsed);
          upsertLiveCandle(nextRow);
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      };

      ws.onerror = () => {
        setStatus("웹소켓 오류");
      };

      ws.onclose = () => {
        setStatus("연결 종료");
      };
    };

    const loadInitialCandles = async () => {
      try {
        setStatus("초기 캔들 조회 중...");

        const response = await fetch(
          `https://api.upbit.com/v1/candles/minutes/${unit}?market=${market}&count=200`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        const rows: CandleRow[] = json.map(toCandleRow).reverse();

        if (cancelled) return;

        applyAllData(rows);
        connectWebSocket();
      } catch (error) {
        console.error("Initial candle load error:", error);
        setStatus("초기 데이터 조회 실패");
      }
    };

    if (chartRef.current && candleSeriesRef.current && maSeriesRef.current) {
      loadInitialCandles();
    }

    return () => {
      cancelled = true;

      if (pingTimer) {
        window.clearInterval(pingTimer);
      }

      if (ws) {
        ws.close();
      }
    };
  }, [market, unit]);

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={badgeStyle}>
          {market} / {unit}분봉 / {status}
        </div>
      </div>

      <div style={priceStyle}>
        {lastPrice !== null ? `${lastPrice.toLocaleString()} KRW` : "-"}
      </div>

      <div style={chartWrapStyle}>
        <div ref={containerRef} style={{...chartBoxStyle, height}} />
      </div>

      <div style={{marginTop: 10, fontSize: 12, color: "#6b7280"}}>
        캔들 + MA20(검정선) 예시
      </div>
    </div>
  );
}
