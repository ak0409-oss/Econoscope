import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface EnvironmentalMetrics {
  // Air Quality
  pm25: number;
  pm10: number;
  no2: number;
  
  // Environmental
  ndvi: number; // Green cover
  lst: number;  // Land Surface Temp (Heat Island)
  waterCapacity: number;
  
  // Socio-Economic
  popDensity: number;
  roadDensity: number;
  carbonIntensity: number;
  
  // Plot
  plotArea: number;
}

export interface AnalysisResult {
  eccScore: number; // Stage 1 output
  recommendedFar: number; // Stage 3 output
  equivalentFloors: number;
  opportunityCost: number;
  bindingConstraint: string;
  shadowPrice: number;
  gdpContribution: number;
  infrastructureStress: number;
  aiInsight: string;
}

export async function analyzeUrbanCapacity(metrics: EnvironmentalMetrics): Promise<AnalysisResult> {
  // STAGE 1: Environmental Carrying Capacity (ECC) Scoring (Simulated XGBoost)
  // Higher is better (more headroom)
  const airQualityFactor = (1 - (metrics.pm25 / 150 + metrics.pm10 / 200 + metrics.no2 / 100) / 3);
  const resourceFactor = (metrics.ndvi * 0.4 + (metrics.waterCapacity / 200) * 0.6);
  const stressFactor = 1 - (metrics.popDensity / 20000 * 0.5 + (metrics.lst - 25) / 20 * 0.5);
  
  const eccScore = Math.max(0, Math.min(100, (airQualityFactor * 0.4 + resourceFactor * 0.4 + stressFactor * 0.2) * 100));

  // STAGE 2: Constraint Optimization (Simulated Linear Programming)
  const CARBON_BUDGET = 500;
  const WATER_DEMAND_PER_FAR = 50;
  const NAAQS_PM25_LIMIT = 60;
  
  // Constraints
  const farFromCarbon = CARBON_BUDGET / metrics.carbonIntensity;
  const farFromWater = metrics.waterCapacity / WATER_DEMAND_PER_FAR;
  const farFromAir = Math.max(0, (NAAQS_PM25_LIMIT - metrics.pm25) / 10);
  const farFromECC = (eccScore / 100) * 5; // ECC score directly caps development intensity

  // STAGE 3: Site-Specific FAR Prediction (Simulated CNN + Tabular NN)
  // We combine the optimized constraints with site-specific features
  const baseFar = Math.min(farFromCarbon, farFromWater, farFromAir, farFromECC, 4.0);
  
  // Simulate CNN "Satellite" boost: High NDVI and good road density allow for slightly more efficient density
  const satelliteBoost = (metrics.ndvi > 0.5 ? 0.2 : -0.1) + (metrics.roadDensity > 15 ? 0.1 : 0);
  const recommendedFar = Math.max(0.5, Math.min(4.0, baseFar + satelliteBoost));

  // Economic & Infrastructure Metrics
  const MAX_POSSIBLE_FAR = 4.0;
  const CONSTRUCTION_VALUE_PER_SQFT = 3500;
  const opportunityCost = Math.max(0, (MAX_POSSIBLE_FAR - recommendedFar) * metrics.plotArea * CONSTRUCTION_VALUE_PER_SQFT);
  const gdpContribution = recommendedFar * metrics.plotArea * CONSTRUCTION_VALUE_PER_SQFT * 0.1;
  const equivalentFloors = Math.ceil(recommendedFar / 0.35); // Assuming 35% ground coverage
  
  const infrastructureStress = (metrics.popDensity / 10000 + recommendedFar / 2) * 10;

  // Determine binding constraint
  let bindingConstraint = "ECC Score (General Sustainability)";
  const constraints = [
    { name: "Carbon Budget", val: farFromCarbon },
    { name: "Water Capacity", val: farFromWater },
    { name: "Air Quality (PM2.5)", val: farFromAir },
    { name: "ECC Limit", val: farFromECC }
  ];
  const sorted = constraints.sort((a, b) => a.val - b.val);
  if (recommendedFar <= sorted[0].val + 0.1) bindingConstraint = sorted[0].name;

  // AI Insight
  const prompt = `
    As EconoScope Urban Advisor, analyze:
    - ECC Score: ${eccScore.toFixed(1)}/100
    - Recommended FAR: ${recommendedFar.toFixed(2)}
    - Binding Constraint: ${bindingConstraint}
    - Air Quality: PM2.5 ${metrics.pm25}, PM10 ${metrics.pm10}
    - Infrastructure Stress: ${infrastructureStress.toFixed(1)}%
    
    Provide a 2-sentence economic justification for this FAR recommendation based on the "Porter Hypothesis" (how environmental regulation can drive innovation).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return {
    eccScore,
    recommendedFar,
    equivalentFloors,
    opportunityCost,
    bindingConstraint,
    shadowPrice: 7.6,
    gdpContribution,
    infrastructureStress,
    aiInsight: response.text || "Analysis complete.",
  };
}
