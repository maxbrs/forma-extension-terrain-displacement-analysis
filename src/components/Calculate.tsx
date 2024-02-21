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
import {Group, Mesh} from "three";
import { cartesian } from "../utils/misc.ts";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {rotationMatrixYUpToZUp} from "./Download.tsx";

type Props = {
  threshold: number;
};

type Terrain = {
  mesh: Mesh;
  triangles: Float32Array;
};

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

async function getTerrainUrn() {
  const [terrainUrn] = await Forma.geometry.getPathsByCategory({
    category: "terrain",
  });
  return terrainUrn;
}

async function loadTerrainTriangles(
  terrainUrn: string,
): Promise<Float32Array> {
  // if (!terrainUrn) {
  //   const terrainUrn = await getTerrainUrn();
  //   const arrayTriangles = await Forma.geometry.getTriangles({ path: terrainUrn });
  //   console.log("noURN", { terrainUrn, arrayTriangles }, arrayTriangles.length / 3)
  //   return arrayTriangles;
  // } else {
  const { element } = await Forma.elements.get({ urn: terrainUrn });
  const volume = await Forma.elements.representations.volumeMesh(element);
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(volume?.data, "");
  gltf.scene.applyMatrix4(rotationMatrixYUpToZUp())
  gltf.scene.updateMatrixWorld()
  const material = new THREE.MeshBasicMaterial();
  material.side = THREE.DoubleSide;

  gltf.scene.traverse((o) => {
    if (o instanceof Mesh) {
      o.name = "analyzedMesh"
      o.geometry.computeVertexNormals()
      o.receiveShadow = true
      o.castShadow = false
      o.material = material

      o.geometry.computeBoundsTree = computeBoundsTree
      o.geometry.disposeBoundsTree = disposeBoundsTree
      o.geometry.computeBoundsTree()
      o.raycast = acceleratedRaycast
    }
  })
  return gltf.scene

    // const arrayTriangles =
    //   gltf.scene.children[0].type === "Mesh"
    //     ? gltf.scene.children[0].geometry.attributes.position.array
    //     : gltf.scene.children[0].children[0].geometry.attributes.position.array;
    //
    // console.log("URN", { element, terrainUrn, gltf, arrayTriangles }, arrayTriangles.length / 3)
    // return new Float32Array(arrayTriangles);
    // const result = new Float32Array(volume?.data)
    // return result
}

async function loadTerrain(
  oldTerrainUrn: string,
): Promise<Terrain> {
  const terrainScene = await loadTerrainTriangles(oldTerrainUrn);
  console.log("parse...", {oldTerrainUrn, terrainScene})

  // const geometry = new THREE.BufferGeometry();
  // geometry.setAttribute(
  //   "position",
  //   new THREE.BufferAttribute(terrainTriangles, 3),
  // );
  // //@ts-ignore
  // geometry.computeBoundsTree();
  //
  // const material = new THREE.MeshBasicMaterial();
  // material.side = THREE.DoubleSide;
  // return {
  //   mesh: new THREE.Mesh(geometry, material),
  //   triangles: terrainTriangles,
  // };
  return terrainScene
}

async function computeElevationDiff(
  x: number,
  y: number,
  newMesh: Group,
  oldMesh: Group,
): Promise<[string, number]> {
  // TODO : temporary test
  if (oldMesh === newMesh) {
    console.log("Same meshes !!", { oldMesh, newMesh })
    return [`${x}, ${y}`, 0];
  }

  // const oldScene = new THREE.Scene();
  // oldScene.add(oldMesh);

  // const newScene = new THREE.Scene();
  // newScene.add(newMesh);

  const origin = new THREE.Vector3(x, y, 10000);
  const direction = new THREE.Vector3(0, 0, -1);
  let raycaster = new THREE.Raycaster();
  raycaster.set(origin, direction);

  const oldIntersection = raycaster.intersectObjects(oldMesh.children)[0]
  const newIntersection = raycaster.intersectObjects(newMesh.children)[0];
  // if (!newIntersection) {
  //   return [`${x}, ${y}`, 1000];
  // }
  // TODO : temporary test
  return [`${x}, ${y}`, newIntersection?.point.z - oldIntersection?.point.z || 0];
}

export default function CalculateAndStore({ threshold }: Props) {
  const calculateTerrainSteepness = useCallback(async () => {
    // TODO : load urn from `input.json`
    const newTerrainUrn =
      "urn:adsk-forma-elements:terrain:pro_awoiewcmej:c8f329d6-10e9-4cd5-b354-12a0348dd98f:1708431903261";
    const oldTerrainUrn =
      "urn:adsk-forma-elements:terrain:pro_awoiewcmej:c8f329d6-10e9-4cd5-b354-12a0348dd98f:1697620352585";

    const [newTerrain, oldTerrain] = await Promise.all([
      loadTerrain(newTerrainUrn),
      loadTerrain(oldTerrainUrn),
    ]);
    // console.log({ newTerrain, oldTerrain });
    if (!oldTerrain || !newTerrain) {
      console.error("Failed to load terrain");
      return;
    }

    const bBox = new THREE.Box3();
    bBox.setFromObject(newTerrain)
    // console.log({bBox})

    // const bBox = {
    //   minX: Number.POSITIVE_INFINITY,
    //   maxX: Number.NEGATIVE_INFINITY,
    //   minY: Number.POSITIVE_INFINITY,
    //   maxY: Number.NEGATIVE_INFINITY,
    // };
    // const terrains = [newTerrain, oldTerrain];
    // terrains.forEach((terrain) => {
    //   console.log({ terrain })
    //   const xValues = terrain.triangles.filter((_, i) => i % 3 === 0);
    //   const [minX, maxX] = getMinMax(xValues);
    //   bBox.minX = Math.min(bBox.minX, minX);
    //   bBox.maxX = Math.max(bBox.maxX, maxX);
    //
    //   // TODO : 1 or 2 ? y or z ?
    //   const yValues = terrain.triangles.filter((_, i) => i % 3 === 2);
    //   const [minY, maxY] = getMinMax(yValues);
    //   bBox.minY = Math.min(bBox.minY, minY);
    //   bBox.maxY = Math.max(bBox.maxY, maxY);
    //   console.log({ terrain, minX, maxX, minY, maxY });
    // });
    console.log({ bBox})
    const diffX = Math.floor((bBox.max.x - bBox.min.x) / SCALE);
    const diffY = Math.floor((bBox.max.y - bBox.min.y) / SCALE);
    const coordsX = Array.from(
      { length: diffX },
      (_, i) => bBox.min.x + i * SCALE,
    );
    const coordsY = Array.from(
      { length: diffY },
      (_, i) => bBox.min.y + i * SCALE,
    );
    console.log("start computing elevation diff")

    // const rightSideCanvas = document.getElementById("identifier") as HTMLCanvasElement
    // const renderer = new THREE.WebGLRenderer({
    //   canvas: rightSideCanvas,
    //   antialias: true,
    //   preserveDrawingBuffer: true,
    //   powerPreference: "high-performance",
    // })
    // const currentCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    // currentCamera.position.set(0, 200, 0)
    // currentCamera.lookAt(0, 0, 0)
    //
    // const scene = new THREE.Scene()
    // scene.add(newTerrain.mesh)
    // scene.add(oldTerrain.mesh)
    // renderer.render(scene, currentCamera)

    console.log({newTerrain, oldTerrain})

    const fetchPromises = [];
    for (const [x, y] of cartesian(coordsX, coordsY)) {
      fetchPromises.push(
        computeElevationDiff(x, y, newTerrain, oldTerrain),
      );
    }

    const result: { [k: string]: number } = Object.fromEntries(
      await Promise.all(fetchPromises),
    )
    console.log("Done with elevation diff")
    let elevationDiff = new Float32Array(diffX * diffY).fill(NaN);
    let minElevation = Number.POSITIVE_INFINITY;
    let maxElevation = Number.NEGATIVE_INFINITY;
    console.log({ result });
    for (let i = 0; i < diffX; i++) {
      // bBox.minX + i * SCALE
      const coordY = bBox.min.y + SCALE + SCALE * i;
      for (let j = 0; j < diffY; j++) {
        const coordX = bBox.min.x + SCALE + SCALE * j;
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
      x: bBox.min.x + (diffX * SCALE) / 2,
      y: bBox.max.y - (diffY * SCALE) / 2,
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
      minX: bBox.min.x,
      maxX: bBox.max.x,
      minY: bBox.min.y,
      maxY: bBox.max.y,
    });
    await saveFloatArray("terrain-steepness-raw", elevationDiff, {
      minElevation,
      maxElevation,
      diffX,
      diffY,
      minX: bBox.min.x,
      maxX: bBox.max.x,
      minY: bBox.min.y,
      maxY: bBox.max.y,
    });
  }, [threshold]);

  return (
    <button onClick={calculateTerrainSteepness} style="width: 100%;">
      Calculate and store results
    </button>
  );
}
