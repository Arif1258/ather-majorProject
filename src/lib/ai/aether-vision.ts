import { linearRegression, linearRegressionLine } from "simple-statistics";

export interface LatencyData {
  timestamp: number;
  pingMs: number;
}

export interface AIAnalysisResult {
  isAnomaly: boolean;
  predictedPingMsAtNextCheck: number;
  trend: "stable" | "degrading" | "improving";
}

export function analyzeLatency(data: LatencyData[]): AIAnalysisResult {
  if (data.length < 5) return { isAnomaly: false, predictedPingMsAtNextCheck: 0, trend: "stable" };

  // Prepare data for simple-statistics
  const regressionData = data.map((d, index) => [index, d.pingMs] as [number, number]);
  
  // Calculate linear regression
  const regressionResult = linearRegression(regressionData);
  const line = linearRegressionLine(regressionResult);
  
  // Predict the next ping
  const nextIndex = data.length;
  const predictedPingMsAtNextCheck = Math.round(line(nextIndex));
  
  // Determine trend based on slope (m in y=mx+b)
  let trend: "stable" | "degrading" | "improving" = "stable";
  if (regressionResult.m > 5) trend = "degrading"; // Latency increasing
  else if (regressionResult.m < -5) trend = "improving"; // Latency decreasing

  // Anomaly if last reading is 3x the predicted or prediction goes over 500ms
  const lastPing = data[data.length - 1].pingMs;
  const isAnomaly = lastPing > predictedPingMsAtNextCheck * 3 || predictedPingMsAtNextCheck > 500;

  return { isAnomaly, predictedPingMsAtNextCheck, trend };
}
