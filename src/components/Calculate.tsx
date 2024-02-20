import * as THREE from "three";
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import { createCanvas } from "../utils";
import { useCallback } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { CANVAS_NAME, SCALE } from "../app";
import { saveCanvas, saveFloatArray } from "../services/storage";
import { Mesh } from "three";
import { cartesian } from "../utils/misc.ts";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

type Props = {
  threshold: number;
};

type Terrain = {
  mesh: Mesh;
  triangles: Float32Array;
};

function getMinMax(array: Float32Array) {
  return array.reduce(
    (acc, curr) => {
      acc[0] = Math.min(acc[0], curr);
      acc[1] = Math.max(acc[1], curr);
      return acc;
    },
    [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
  );
}

// Speed up raycasting using https://github.com/gkjohnson/three-mesh-bvh
// @ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
// @ts-ignore
THREE.Mesh.prototype.raycast = acceleratedRaycast;
const raycaster = new THREE.Raycaster();
// For this analysis we only need the first hit, which is faster to compute
// @ts-ignore
raycaster.firstHitOnly = true;

async function getTerrainUrn() {
  const [terrainUrn] = await Forma.geometry.getPathsByCategory({
    category: "terrain",
  });
  return terrainUrn;
}

async function loadTerrainTriangles(
  terrainUrn: string | undefined,
): Promise<Float32Array> {
  // debugger;
  if (!terrainUrn) {
    const terrainUrn = await getTerrainUrn();
    return await Forma.geometry.getTriangles({ path: terrainUrn });
  } else {
    const { element } = await Forma.elements.get({ urn: terrainUrn });
    const volume = await Forma.elements.representations.volumeMesh(element);

    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(volume?.data, "");
    return new Float32Array(
      gltf.scene.children[0].geometry.attributes.position.array,
    );
    // console.log({gltf})
    // return new Float32Array(gltf.scene.children)
  }
}

async function loadTerrain(
  oldTerrainUrn: string | undefined,
): Promise<Terrain> {
  const terrainTriangles = await loadTerrainTriangles(oldTerrainUrn);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(terrainTriangles, 3),
  );

  //@ts-ignore
  geometry.computeBoundsTree();

  const material = new THREE.MeshBasicMaterial();
  material.side = THREE.DoubleSide;
  return {
    mesh: new THREE.Mesh(geometry, material),
    triangles: terrainTriangles,
  };
}

async function computeElevationDiff(
  x: number,
  y: number,
  oldMesh: Mesh,
  newMesh: Mesh,
): Promise<[string, number]> {
  if (oldMesh === newMesh) {
    return [`${x}, ${y}`, 0];
  }
  const oldScene = new THREE.Scene();
  oldScene.add(oldMesh);

  const newScene = new THREE.Scene();
  newScene.add(newMesh);

  const origin = new THREE.Vector3(x, y, 10000);
  const direction = new THREE.Vector3(0, 0, -1);
  let raycaster = new THREE.Raycaster();
  raycaster.set(origin, direction);

  // const oldIntersection = raycaster.intersectObjects(oldScene.children)[0]
  const newIntersection = raycaster.intersectObjects(newScene.children)[0];

  // TODO : temporary test
  return [`${x}, ${y}`, newIntersection?.point.z]; // - oldIntersection?.point.z]
}

export default function CalculateAndStore({ threshold }: Props) {
  const calculateTerrainSteepness = useCallback(async () => {
    // TODO : load urn from `input.json`
    const newTerrainUrn =
      "urn:adsk-forma-elements:terrain:pro_bteceqejok:db4ff4fa-576a-4958-a635-18323ae008ad:1707828293795";
    const oldTerrainUrn =
      "urn:adsk-forma-elements:terrain:pro_bteceqejok:db4ff4fa-576a-4958-a635-18323ae008ad:1689843466308";

    const [newTerrain, oldTerrain] = await Promise.all([
      loadTerrain(newTerrainUrn),
      loadTerrain(oldTerrainUrn),
    ]);
    console.log({ newTerrain, oldTerrain });
    if (!oldTerrain || !newTerrain) {
      console.error("Failed to load terrain");
      return;
    }
    const bBox = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };
    const terrains = [newTerrain, oldTerrain];
    terrains.forEach((terrain) => {
      const xValues = terrain.triangles.filter((_, i) => i % 3 === 0);
      const [minX, maxX] = getMinMax(xValues);
      bBox.minX = Math.min(bBox.minX, minX);
      bBox.maxX = Math.max(bBox.maxX, maxX);
      const yValues = terrain.triangles.filter((_, i) => i % 3 === 1);
      const [minY, maxY] = getMinMax(yValues);
      bBox.minY = Math.min(bBox.minY, minY);
      bBox.maxY = Math.max(bBox.maxY, maxY);
      console.log({ terrain, minX, maxX, minY, maxY });
    });

    const diffX = Math.floor((bBox.maxX - bBox.minX) / SCALE);
    const diffY = Math.floor((bBox.maxY - bBox.minY) / SCALE);
    const coordsX = Array.from(
      { length: diffX },
      (_, i) => bBox.minX + i * SCALE,
    );
    const coordsY = Array.from(
      { length: diffY },
      (_, i) => bBox.minY + i * SCALE,
    );

    const fetchPromises = [];
    for (const [x, y] of cartesian(coordsX, coordsY)) {
      fetchPromises.push(
        computeElevationDiff(x, y, newTerrain.mesh, oldTerrain.mesh),
      );
    }

    const result: { [k: string]: number } = Object.fromEntries(
      await Promise.all(fetchPromises),
    );

    let elevationDiff = new Float32Array(diffX * diffY).fill(NaN);
    let minElevation = Number.POSITIVE_INFINITY;
    let maxElevation = Number.NEGATIVE_INFINITY;
    console.log({ result });
    for (let i = 0; i < diffX; i++) {
      // bBox.minX + i * SCALE
      const coordY = bBox.minY + SCALE + SCALE * i;
      console.log({ coordY });
      for (let j = 0; j < diffY; j++) {
        const coordX = bBox.minX + SCALE + SCALE * j;
        const delta = result[`${coordX}, ${coordY}`];
        elevationDiff[i * diffX + j] = delta;
        if (delta || delta === 0) {
          minElevation = Math.min(delta, minElevation);
          maxElevation = Math.max(delta, maxElevation);
        }
      }
    }
    const canvas = createCanvas(
      elevationDiff,
      diffX,
      diffY,
      minElevation,
      maxElevation,
      // threshold
    );

    // need to find the reference point of the terrain to place the canvas
    // for this analysis, it's the middle of the terrain
    const position = {
      x: bBox.minX + (diffX * SCALE) / 2,
      y: bBox.maxY - (diffY * SCALE) / 2,
      z: 29, // need to put the texture higher up than original
    };

    await Forma.terrain.groundTexture.add({
      name: CANVAS_NAME,
      canvas,
      position,
      scale: { x: SCALE, y: SCALE },
    });
    await saveCanvas("terrain-steepness-png", canvas, {
      steepnessThreshold: threshold,
      minX: bBox.minX,
      maxX: bBox.maxX,
      minY: bBox.minY,
      maxY: bBox.maxY,
    });
    await saveFloatArray("terrain-steepness-raw", elevationDiff, {
      minElevation,
      maxElevation,
      diffX,
      diffY,
      minX: bBox.minX,
      maxX: bBox.maxX,
      minY: bBox.minY,
      maxY: bBox.maxY,
    });
  }, [threshold]);

  return (
    <button onClick={calculateTerrainSteepness} style="width: 100%;">
      Calculate and store results
    </button>
  );
}
