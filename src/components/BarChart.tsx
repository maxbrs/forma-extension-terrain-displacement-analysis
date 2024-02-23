import { ResponsiveBar } from "@nivo/bar"
import {ElevationDataType} from "../state/application-state.ts";
import { useMemo } from "preact/hooks";
import {colors} from "../services/Visualize.ts";


interface BarChartProps {
  data: ElevationDataType | undefined;
  showPercent?: boolean
}

function findNonZero(data: { index: string, [key: number]: number }[], direction: 'first' | 'last'): number {
  let arrayToSearch = direction === 'first' ? data : [...data].reverse();

  let nonZeroIndex = arrayToSearch.findIndex(item => {
    for (let key in item) {
      if (key !== 'index' && item[key] !== 0) {
        return true;
      }
    }
    return false;
  });

  return direction === 'first' ? nonZeroIndex : data.length - 1 - nonZeroIndex;
}

function removeConsecutiveZeros(data: { index: string, [key: number]: number }[]): { index: string, [key: number]: number }[] {
  let firstNonZero = findNonZero(data, 'first');
  let lastNonZero = findNonZero(data, 'last');

  if (firstNonZero === -1 && lastNonZero === -1) {
    return [];
  } else {
    return data.slice(firstNonZero, lastNonZero + 1);
  }
}

function restructureData(data: { array: Float32Array, bins: number[][] }): { index: string, [key: number]: number }[] | undefined {
  const array = data.array.filter((x) => Math.abs(x) > .5);
  let result: { index: string, [key: number]: number }[] = [];
  // Assuming that the bins are sorted and non-overlapping
  for (let i = 0; i < data.bins.length; i++) {
    let count = 0;
    for (let j = 0; j < data.array.length; j++) {
      if (data.bins[i][0] <= array[j] && array[j] < data.bins[i][1]) {
        count++;
      }
    }
    const binAvg = Number((data.bins[i][0] + data.bins[i][1]) / 2).toFixed(0);
    // const [start, end] = data.bins[i].map(num => Number(num.toFixed(1)));
    let obj = { index: `~ ${binAvg} m` }
    obj = { ...obj, [i]: count };
    result.push(obj);
  }
  const filteredResult = removeConsecutiveZeros(result)
  if (!result || result.length === 0) {
    return;
  }
  return filteredResult.reverse();
}

export function BarChart({ data }: BarChartProps) {
  const updatedChartData = useMemo(() => {
    if (!data || data.array.length === 0) {
      return null;
    }
    return restructureData(data)
  }, [data])

  const colorList = useMemo(() => {
    const colorList: string[] = []
    updatedChartData?.forEach((d) => {
      const idx = Number(Object.keys(d).filter(key => key !== "index")[0])
      colorList.push(colors[idx])
    })
    return colorList;
  }, [updatedChartData])

  console.log({ updatedChartData, colorList })

  return (
    (updatedChartData && (
      <ResponsiveBar
        data={updatedChartData}
        keys={[...Array(colors.length).keys()].map(String)}
        indexBy="index"
        layout="horizontal"
        margin={{ top: 50, right: 20, bottom: 60, left: 70 }}
        padding={0.2}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={colorList.reverse()}
        borderColor="black"
        borderWidth={.25}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 90,
          legend: 'Area',
          legendPosition: 'middle',
          legendOffset: 55
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Elevation difference (m)',
          legendPosition: 'middle',
          legendOffset: -65
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[]}
        animate={true}
      />
    )) ||
    <p>nothing to see here ...</p>
  )
}
