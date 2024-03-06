import {
  EXTENSION_KEY,
  inputScale,
  projectSettings,
  Settings,
} from "../../state/application-state.ts";
import { saveJSONObject } from "../../services/Storage.ts";
import { useCallback } from "preact/hooks";

type Props = {
  settings: Settings;
};

export default function InputURN({ settings }: Props) {
  const saveSettings = useCallback(async () => {
    await saveJSONObject(`${EXTENSION_KEY}/settings`, settings);
  }, [settings]);

  return (
    <>
      <h3>Add URNs of terrains to compare</h3>
      <div className="section">
        <p>Alternative terrain</p>
        <input
          style={{ fontSize: "10px" }}
          type="string"
          placeholder="proposal URN"
          value={settings.otherTerrainUrn}
          onChange={(e) =>
            (projectSettings.value = {
              ...settings,
              otherTerrainUrn: e.currentTarget.value,
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
            max="5"
            value={inputScale.value}
            onChange={(e) => (inputScale.value = Number(e.currentTarget.value))}
          />
        </>
      </div>
      <button onClick={saveSettings} style="width: 100%">
        Save inputs
      </button>
    </>
  );
}
