import * as faceapi from "@vladmandic/face-api";
import * as tf from "@tensorflow/tfjs-node";

// Функция для обнаружения лиц на изображении
export async function detectFaces(imageBuffer: Buffer): Promise<
  | faceapi.ComputeAllFaceDescriptorsTask<
      faceapi.WithFaceLandmarks<{
        detection: faceapi.FaceDetection;
      }>
    >
  | []
> {
  // Преобразуем изображение в тензор с помощью TensorFlow.js
  const tensor: tf.Tensor3D | tf.Tensor4D = tf.node.decodeImage(imageBuffer);

  // Получаем все лица с их маркерами и дескрипторами
  const detections = await faceapi
    .detectAllFaces(tensor as unknown as faceapi.TNetInput)
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections;
}

export function findDistance(
  faceEmbedding_first: Float32Array | number[],
  faceEmbedding_second: Float32Array | number[],
): number {
  return faceapi.euclideanDistance(faceEmbedding_first, faceEmbedding_second);
}
