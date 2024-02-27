import { Forma } from "forma-embedded-view-sdk/auto";

function arrayToBuffer(array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(array.length * Float32Array.BYTES_PER_ELEMENT);
  const arr = new Float32Array(buffer);
  arr.set(array);
  return arr;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

async function canvasFromDataUrl(url: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2d context from canvas");
  }
  return await loadImage(url)
    .then((image) => {
      canvas.height = image.height;
      canvas.width = image.width;
      ctx.drawImage(image, 0, 0);
      return canvas;
    })
    .catch((err) => {
      console.error("failed to load canvas from url", err);
    });
}

export async function saveJSONObject(
  key: string,
  value: { [key: string]: any },
) {
  const proposalId = await Forma.proposal.getId()
  await Forma.extensions.storage.setObject({
    key: `${key}_${proposalId}`,
    data: JSON.stringify(value),
  });
}

export async function saveCanvas(
  key: string,
  canvas: HTMLCanvasElement,
  metadata?: { [key: string]: any },
) {
  const proposalId = await Forma.proposal.getId()
  await Forma.extensions.storage.setObject({
    key: `${key}_${proposalId}`,
    data: canvas.toDataURL(),
    metadata: JSON.stringify(metadata),
  });
}

export async function saveFloatArray(
  key: string,
  arr: Float32Array,
  metadata?: { [key: string]: any },
) {
  const proposalId = await Forma.proposal.getId()
  await Forma.extensions.storage.setObject({
    key: `${key}_${proposalId}`,
    data: arrayToBuffer(arr),
    metadata: JSON.stringify(metadata),
  });
}

export async function getJSONObject(key: string) {
  const proposalId = await Forma.proposal.getId()
  const storageObject = await Forma.extensions.storage.getTextObject({ key: `${key}_${proposalId}` });
  if (!storageObject) {
    return;
  }
  const data = JSON.parse(storageObject.data);
  return {
    data,
    metadata: JSON.parse(storageObject.metadata || "{}") as {
      [key: string]: any;
    },
  };
}

export async function getCanvasObject(key: string) {
  const proposalId = await Forma.proposal.getId()
  const storageObject = await Forma.extensions.storage.getTextObject({ key: `${key}_${proposalId}` });
  if (!storageObject) {
    return;
  }
  const canvas = await canvasFromDataUrl(storageObject.data);
  if (!canvas) {
    return;
  }
  return {
    canvas,
    metadata: JSON.parse(storageObject.metadata || "{}") as {
      [key: string]: any;
    },
  };
}

export async function getFloat32Array(key: string) {
  const proposalId = await Forma.proposal.getId()
  const storageObject = await Forma.extensions.storage.getBinaryObject({ key: `${key}_${proposalId}` });
  if (!storageObject) {
    return;
  }
  return {
    arr: new Float32Array(storageObject.data),
    metadata: JSON.parse(storageObject.metadata || "{}") as {
      [key: string]: any;
    },
  };
}
