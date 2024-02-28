import { ResponsiveBar } from "@nivo/bar";
import { ElevationDataType, inputScale } from "../state/application-state.ts";
import { useMemo } from "preact/hooks";
import { colors } from "../services/Visualize.ts";

type ChartType = "hist" | "diff";

interface BarChartProps {
  data: ElevationDataType | undefined;
  type: ChartType;
  showPercent?: boolean;
}

function findNonZero(
  data: { index: string; [key: number]: number }[],
  direction: "first" | "last",
): number {
  let arrayToSearch = direction === "first" ? data : [...data].reverse();

  let nonZeroIndex = arrayToSearch.findIndex((item) => {
    for (let key in item) {
      if (key !== "index" && item[key] !== 0) {
        return true;
      }
    }
    return false;
  });

  return direction === "first" ? nonZeroIndex : data.length - 1 - nonZeroIndex;
}

function removeConsecutiveZeros(
  data: { index: string; [key: number]: number }[],
): { index: string; [key: number]: number }[] {
  let firstNonZero = findNonZero(data, "first");
  let lastNonZero = findNonZero(data, "last");
  return data.slice(firstNonZero, lastNonZero + 1);
}

function restructureData(
  data: {
    array: Float32Array;
    bins: number[][];
  },
  type: ChartType,
): { index: string; [key: number]: number }[] | undefined {
  const array =
    type === "hist" ? data.array.filter((x) => Math.abs(x) > 0.5) : data.array;
  const bins =
    type === "hist"
      ? data.bins
      : [
          [Number.NEGATIVE_INFINITY, 0],
          [0, Number.POSITIVE_INFINITY],
        ];

  let result: { index: string; [key: number]: number }[] = [];
  // Assuming that the bins are sorted and non-overlapping
  for (let i = 0; i < bins.length; i++) {
    let count = 0;
    for (let j = 0; j < array.length; j++) {
      if (bins[i][0] <= array[j] && array[j] < bins[i][1]) {
        type === "hist" ? count++ : (count += array[j]);
      }
    }
    const binAvg = Number((bins[i][0] + bins[i][1]) / 2).toFixed(0);
    // const [start, end] = data.bins[i].map(num => Number(num.toFixed(1)));
    let obj = {
      index:
        type === "hist" ? `~ ${binAvg} m` : i === 0 ? "to remove" : "to add",
    };
    obj = { ...obj, [i]: Math.round(count * inputScale.value ** 2) };
    result.push(obj);
  }
  if (!result || result.length === 0) {
    return;
  }
  return removeConsecutiveZeros(result);
}

const HISTCOLORIDX = 3;

export function BarChart({ data, type }: BarChartProps) {
  const updatedChartData = useMemo(() => {
    if (!data || data.array.length === 0) {
      return;
    }
    const restructuredData = restructureData(data, type);
    return type === "hist" ? restructuredData?.reverse() : restructuredData;
  }, [data, type]);

  const colorList = useMemo(() => {
    const colorList: string[] = [];
    updatedChartData?.forEach((d) => {
      const idx = Number(Object.keys(d).filter((key) => key !== "index")[0]);
      colorList.push(colors[idx]);
    });
    return type === "hist" ? colorList?.reverse() : colorList;
  }, [updatedChartData, type]);

  return (
    (updatedChartData && (
      <div style={{ height: type === "hist" ? 300 : 200, border: 1 }}>
        {type === "hist" ? <h4>Depth distribution</h4> : <h4>Mass balance</h4>}
        <ResponsiveBar
          data={updatedChartData}
          keys={[...Array(colors.length).keys()].map(String)}
          indexBy="index"
          layout={type === "hist" ? "horizontal" : "vertical"}
          margin={{ top: 5, right: 20, bottom: 60, left: 70 }}
          padding={type === "hist" ? 0.2 : 0}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={
            type === "hist"
              ? colorList
              : [
                  colors[HISTCOLORIDX],
                  colors[colors.length - (1 + HISTCOLORIDX)],
                ]
          }
          borderColor="black"
          borderWidth={0.25}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: type === "hist" ? 90 : 0,
            legend: type === "hist" ? "Area in m2" : "",
            legendPosition: "middle",
            legendOffset: 55,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: type === "hist" ? "Depth (m)" : "Volume (m3)",
            legendPosition: "middle",
            legendOffset: -65,
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          legends={[]}
          animate={true}
        />
      </div>
    )) ||
    null
  );
}
