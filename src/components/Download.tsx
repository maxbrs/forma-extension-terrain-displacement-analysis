import {Matrix4} from "three";

export function rotationMatrixYUpToZUp() {
  const rotationMatrix = new Matrix4()
  rotationMatrix.makeRotationX(Math.PI / 2)
  return rotationMatrix
}
