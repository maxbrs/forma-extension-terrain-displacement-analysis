import { ResponsiveBar } from "@nivo/bar";
import { ElevationDataType } from "../state/application-state.ts";
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

  if (firstNonZero === -1 && lastNonZero === -1) {
    return [];
  } else {
    return data.slice(firstNonZero, lastNonZero + 1);
  }
}

function restructureData(data: {
  array: Float32Array;
  bins: number[][];
}, type: ChartType): { index: string; [key: number]: number }[] | undefined {
  let array = data.array;
  let bins = data.bins;

  if (type === "hist") {
    // TODO
    array = data.array.filter((x) => Math.abs(x) > 0.5);
  } else {
    bins = [[Number.NEGATIVE_INFINITY, 0], [0, Number.POSITIVE_INFINITY]];
  }

  let result: { index: string; [key: number]: number }[] = [];
  // Assuming that the bins are sorted and non-overlapping
  for (let i = 0; i < bins.length; i++) {
    let count = 0;
    for (let j = 0; j < array.length; j++) {
      if (bins[i][0] <= array[j] && array[j] < bins[i][1]) {
        count++;
      }
    }
    const binAvg = Number((bins[i][0] + bins[i][1]) / 2).toFixed(0);
    // const [start, end] = data.bins[i].map(num => Number(num.toFixed(1)));
    let obj = { index: `~ ${binAvg} m` };
    obj = { ...obj, [i]: count };
    result.push(obj);
  }
  if (!result || result.length === 0) {
    return;
  }
  return removeConsecutiveZeros(result);
}

export function BarChart({ data, type }: BarChartProps) {
  const updatedChartData = useMemo(() => {
    if (!data || data.array.length === 0) {
      return null;
    }
    return restructureData(data, type)?.reverse();
  }, [data, type]);

  const colorList = useMemo(() => {
    const colorList: string[] = [];
    updatedChartData?.forEach((d) => {
      const idx = Number(Object.keys(d).filter((key) => key !== "index")[0]);
      colorList.push(colors[idx]);
    });
    return colorList.reverse();
  }, [updatedChartData]);

  return (
    (updatedChartData && (
      <ResponsiveBar
        data={updatedChartData}
        keys={[...Array(colors.length).keys()].map(String)}
        indexBy="index"
        layout="horizontal"
        margin={{ top: 50, right: 20, bottom: 60, left: 70 }}
        padding={0.2}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={type === "hist" ? colorList : [colors[0], colors[colors.length - 1]]}
        borderColor="black"
        borderWidth={0.25}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 90,
          legend: "Area",
          legendPosition: "middle",
          legendOffset: 55,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Elevation difference (m)",
          legendPosition: "middle",
          legendOffset: -65,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        legends={[]}
        animate={true}
      />
    )) || <p>nothing to see here ...</p>
  );
}
