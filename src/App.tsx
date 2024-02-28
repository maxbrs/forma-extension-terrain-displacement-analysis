import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect } from "preact/hooks";
import CalculateAndStore from "./components/Calculate";
import { getJSONObject } from "./services/Storage.ts";
import { BarChart } from "./components/BarChart.tsx";
import {
  DEFAULT_SETTINGS,
  deltaMass,
  elevation,
  loadingData,
  projectSettings,
} from "./state/application-state.ts";
import InputURN from "./components/InputURN.tsx";

export const CANVAS_NAME = "mass displacement";

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "weave-button": JSX.HTMLAttributes<HTMLElement> & {
//         authContext: string
//         elementUrnPrefix: string
//         activeAnalysis: string
//         typeFilter?: string[]
//       }
//     }
//   }
// }

export default function App() {
  useEffect(() => {
    getJSONObject("settings").then((res) => {
      if (!res) {
        projectSettings.value = DEFAULT_SETTINGS;
        return;
      }
      projectSettings.value = res.data;
    });
  }, []);

  if (!projectSettings.value) {
    return <div>loading...</div>;
  }

  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
    elevation.value = undefined;
    deltaMass.value = undefined;
    loadingData.value = false;
  }, []);

  // const testCode = useCallback(async () => {
  //   // console.log("Testing code ...");
  //   const selectedPaths = await Forma.selection.getSelection()
  //   const buildingPaths = await Forma.geometry.getPathsByCategory({ category: "site_limit" })
  //   const selectedSiteLimitsPaths = selectedPaths.filter(path => buildingPaths.includes(path))
  //   console.log("Test ... ", { selectedSiteLimitsPaths, length: selectedSiteLimitsPaths.length });
  // }, []);

  return (
    <>
      <h2 style="margin-top: 15px">Mass Displacement Analysis</h2>
      {/*<Tabs><Tab><p>hello</p></Tab><Tab><p>This is Tab 2 content</p></Tab></Tabs>*/}
      <InputURN settings={projectSettings.value}></InputURN>
      {/*<InputSiteLimit siteLimits={selectedSiteLimits.value}></InputSiteLimit>*/}
      <CalculateAndStore
        oldTerrainUrn={projectSettings.value.oldTerrainUrn}
        newTerrainUrn={projectSettings.value.newTerrainUrn}
      />
      <button
        onClick={removeTerrainSlope}
        style="width: 100%"
        disabled={!elevation.value}
        onMouseOver={() =>
          elevation.value ? "" : "Click on 'Calculate' first."
        }
      >
        Remove results from terrain
      </button>
      {/*<button onClick={testCode} style="width: 100%">Test code ...</button>*/}
      <h3>Elevation difference stats</h3>
      {loadingData.value ? (
        <p>Calculations in progress, please wait ...</p>
      ) : (
        <>
          {deltaMass.value ? (
            <p>
              Overall mass difference: {deltaMass.value > 0 ? "+" : null}
              {deltaMass.value} m3
            </p>
          ) : (
            <p>
              Calculate elevation difference to see mass displacement results.
            </p>
          )}
          <BarChart data={elevation.value} type={"diff"} />
          <BarChart data={elevation.value} type={"hist"} />
        </>
      )}
    </>
  );
}
