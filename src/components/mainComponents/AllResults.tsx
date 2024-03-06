import ResultsLoading from "../subComponents/ResultsLoading.tsx";
import { BarChart } from "../subComponents/BarChart.tsx";
import {
  deltaMass,
  elevation,
  identicalTerrains,
} from "../../state/application-state.ts";
import { formatBigNumber } from "../../utils/misc.ts";

type Props = {
  loading: boolean;
};

export default function AllResults({ loading }: Props) {
  return (
    <>
      <h3>Elevation difference stats</h3>
      {loading ? (
        <ResultsLoading />
      ) : (
        <>
          {deltaMass.value ? (
            <p style="font-size: 1.15em">
              Mass difference:
              <b>
                {" "}
                {deltaMass.value > 0 ? "+" : null}
                {formatBigNumber(deltaMass.value)}
              </b>{" "}
              m3
            </p>
          ) : (
            <>
              {identicalTerrains.value ? (
                <div className="alert alert-warning">
                  <strong>Warning!</strong> The terrains are identical. No mass
                  displacement.
                </div>
              ) : null}
              <p>
                Calculate elevation difference to see mass displacement results.
              </p>
            </>
          )}
          <BarChart data={elevation.value} type={"diff"} />
          <BarChart data={elevation.value} type={"hist"} />
        </>
      )}
    </>
  );
}
