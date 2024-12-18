import { onValueCreated } from "firebase-functions/v2/database";
import * as admin from "firebase-admin";

admin.initializeApp({
  databaseURL: "https://final-year-project-5f26d-default-rtdb.asia-southeast1.firebasedatabase.app",
});

// Sensor thresholds
const SENSOR_THRESHOLDS = {
  ph: {
    danger: [0, 6.0, 9.5, 14],
    warning: [6.0, 7.0, 8.0, 9.5],
    safe: [7.0, 8.0],
  },
  tds: {
    danger: [2000, 3000],
    warning: [1000, 2000],
    safe: [300, 1000],
  },
  temperature: {
    danger: [0, 10, 35, 40],
    warning: [10, 20, 30, 35],
    safe: [20, 30],
  },
};

// Type Definitions
type SensorType = keyof typeof SENSOR_THRESHOLDS;
type SensorThresholds = { danger: number[]; warning: number[]; safe: number[] };

// Check thresholds
const checkThreshold = (sensorType: SensorType, value: number): "danger" | "warning" | "safe" => {
  const thresholds: SensorThresholds = SENSOR_THRESHOLDS[sensorType];
  if (sensorType === "tds") {
    if (value > thresholds.danger[0]) return "danger";
    if (value > thresholds.warning[0]) return "warning";
  } else {
    if (value < thresholds.danger[1] || value > thresholds.danger[2]) return "danger";
    if (value < thresholds.warning[1] || value > thresholds.warning[2]) return "warning";
  }
  return "safe";
};

// Recommendations based on status
const getRecommendations = (sensorType: SensorType, status: "danger" | "warning"): string => {
  const recommendations = {
    ph: {
      danger: "Adjust pH immediately by adding buffer solutions for acidity or diluted acids for alkalinity.",
      warning: "Monitor pH and prepare buffer solutions to stabilize.",
    },
    tds: {
      danger: "Perform partial water changes and check for salt/mineral accumulation.",
      warning: "Reduce feed and apply filtration to lower TDS levels.",
    },
    temperature: {
      danger: "Use heaters for cold or chillers/shading for high temperatures.",
      warning: "Monitor temperature trends. Prepare cooling/heating systems.",
    },
  };

  return recommendations[sensorType][status];
};

// Firebase Realtime Database trigger
export const monitorSensorData = onValueCreated(
  {
    region: "asia-southeast1", // Match your database region
    ref: "sensors/{sensorType}/{timestamp}", // Database path
  },
  async (event) => {
    const sensorType: string = event.params?.sensorType || "";
    const value: unknown = event.data?.val();

    // Validate sensor type and value
    if (!(sensorType in SENSOR_THRESHOLDS) || typeof value !== "number") {
      console.error("Invalid sensor type or value:", sensorType, value);
      return;
    }

    const typedSensor = sensorType as SensorType;
    const status = checkThreshold(typedSensor, value);

    // Notification details
    let messageTitle = "";
    let messageBody = "";

    if (status === "danger") {
      messageTitle = `❗ Critical Alert: ${typedSensor.toUpperCase()}`;
      messageBody = `${typedSensor.toUpperCase()} level has exceeded safe limits at ${value}.\n\nImmediate action required!\n\nRecommendation:\n${getRecommendations(typedSensor, status)}`;
    } else if (status === "warning") {
      messageTitle = `⚠️ Warning: ${typedSensor.toUpperCase()}`;
      messageBody = `${typedSensor.toUpperCase()} level is approaching a non-optimal range at ${value}.\n\nPrepare to take corrective actions!\n\nRecommendation:\n${getRecommendations(typedSensor, status)}`;
    } else {
      return; // Safe range, no action
    }

    // Send FCM notification
    const message = {
      topic: "sensor-alerts",
      notification: {
        title: messageTitle,
        body: messageBody,
      },
      data: {
        sensorType: typedSensor,
        value: value.toString(),
        status: status,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await admin.messaging().send(message);
      console.log("Notification sent:", messageTitle, messageBody);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);
