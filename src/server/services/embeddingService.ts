import * as faceapi from "@vladmandic/face-api";
import * as tf from "@tensorflow/tfjs-node";
import {
  ComputeAllFaceDescriptorsTask,
  FaceDetection,
  WithFaceLandmarks,
} from "@vladmandic/face-api";

// Функция для обнаружения лиц на изображении
export async function detectFaces(imageBuffer: Buffer): Promise<
  ComputeAllFaceDescriptorsTask<
    WithFaceLandmarks<{
      detection: FaceDetection;
    }>
  >
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
