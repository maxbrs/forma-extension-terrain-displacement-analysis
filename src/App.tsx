import { Forma } from "forma-embedded-view-sdk/auto";
import { useCallback, useEffect, useState } from "preact/hooks";
import CalculateAndStore from "./components/Calculate";
import { getJSONObject, saveJSONObject } from "./services/Storage.ts";
import { BarChart } from "./components/BarChart.tsx";
import { elevation } from "./state/application-state.ts";

type Settings = {
  oldTerrainUrn: string;
  newTerrainUrn: string;
};

const DEFAULT_SETTINGS: Settings = {
  oldTerrainUrn: "",
  newTerrainUrn: "",
};

export const SCALE = 2;

export const CANVAS_NAME = "terrain displacement";

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
  }, []);

  const saveSettings = useCallback(async () => {
    await saveJSONObject("settings", projectSettings);
  }, [projectSettings]);

  return (
    <>
      <h2 style="margin-top: 15px">Terrain Mass Displacement analysis</h2>
      <div className="section">
        <p>Calculate and visualize terrain mass displacement</p>
      </div>

      <p>Add URNs of terrains to compare</p>
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
      <button onClick={saveSettings} style="width: 100%">
        Save inputs
      </button>
      <CalculateAndStore
        oldTerrainUrn={projectSettings.oldTerrainUrn}
        newTerrainUrn={projectSettings.newTerrainUrn}
      />
      <button onClick={removeTerrainSlope} style="width: 100%">
        Remove terrain slope drawing
      </button>
      <div style={{ height: 400, border: 1 }}>
        <BarChart data={elevation.value} type={"hist"} />
      </div>
      <div style={{ height: 300, border: 1 }}>
        <BarChart data={elevation.value} type={"diff"} />
      </div>
    </>
  );
}
