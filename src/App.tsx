import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import CalculateAndStore from "./components/Calculate";
import { getJSONObject, saveJSONObject } from "./services/Storage.ts";
import { BarChart } from "./components/BarChart.tsx";
import {
  deltaMass,
  elevation,
  inputScale,
  loadingData,
} from "./state/application-state.ts";

type Settings = {
  oldTerrainUrn: string;
  newTerrainUrn: string;
};

const DEFAULT_SETTINGS: Settings = {
  oldTerrainUrn: "",
  newTerrainUrn: "",
};

export const CANVAS_NAME = "mass displacement";

export default function App() {
  const [projectSettings, setProjectSettings] = useState<Settings>();

  useEffect(() => {
    getJSONObject("settings").then((res) => {
      if (!res) {
        setProjectSettings(DEFAULT_SETTINGS);
        return;
      }
      setProjectSettings(res.data);
    });
  }, []);

  if (!projectSettings) {
    return <div>loading...</div>;
  }

  const removeTerrainSlope = useCallback(() => {
    Forma.terrain.groundTexture.remove({ name: CANVAS_NAME });
    elevation.value = undefined;
    deltaMass.value = undefined;
    loadingData.value = false;
  }, []);

  const saveSettings = useCallback(async () => {
    await saveJSONObject("settings", projectSettings);
  }, [projectSettings]);

  return (
    <>
      <h2 style="margin-top: 15px">Mass Displacement Analysis</h2>
      <h3>Add URNs of terrains to compare</h3>
      <div className="section">
        <p>Initial terrain</p>
        <input
          type="string"
          value={projectSettings.oldTerrainUrn}
          onChange={(e) =>
            setProjectSettings({
              ...projectSettings,
              oldTerrainUrn: e.currentTarget.value,
            })
          }
        />
      </div>
      <div className="section">
        <p>Alternative terrain</p>
        <input
          type="string"
          value={projectSettings.newTerrainUrn}
          onChange={(e) =>
            setProjectSettings({
              ...projectSettings,
              newTerrainUrn: e.currentTarget.value,
            })
          }
        />
      </div>
      <div className="section">
        <p>Sampling scale</p>
        <>
          <p>{inputScale.value}m</p>
          <input
            style={{ width: "50%" }}
            type="range"
            min="1"
            max="10"
            value={inputScale.value}
            onChange={(e) => (inputScale.value = Number(e.currentTarget.value))}
          />
        </>
      </div>
      <button onClick={saveSettings} style="width: 100%">
        Save inputs
      </button>
      <CalculateAndStore
        oldTerrainUrn={projectSettings.oldTerrainUrn}
        newTerrainUrn={projectSettings.newTerrainUrn}
      />
      <button
        onClick={removeTerrainSlope}
        style="width: 100%"
        disabled={!elevation.value}
        onMouseOver={() =>
          elevation.value ? "" : "Click on 'Calculate' first."
        }
      >
        Remove terrain slope
      </button>
      <h4>Elevation difference stats</h4>
      {loadingData.value ? (
        <p>Calculations in progress, please wait ...</p>
      ) : (
        <>
          {deltaMass.value ? (
            <p>Overall mass difference: {deltaMass.value > 0 ? "+" : null}{deltaMass.value} m3</p>
          ) : (
            <p>Calculate elevation difference to see mass displacement results.</p>
          )}
          <BarChart data={elevation.value} type={"diff"}/>
          <BarChart data={elevation.value} type={"hist"}/>
        </>
      )}
    </>
  );
}
