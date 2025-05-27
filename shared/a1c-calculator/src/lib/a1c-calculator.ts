/**
 * A1C Calculator
 * 
 * This module provides functions to estimate A1C levels based on glucose readings.
 * The estimation is based on the formula: A1C = (Average Glucose + 46.7) / 28.7
 * 
 * Reference: Nathan DM, Kuenen J, Borg R, et al. Translating the A1C assay into estimated average glucose values. 
 * Diabetes Care. 2008;31(8):1473-1478. doi:10.2337/dc08-0545
 */

export interface GlucoseReading {
  glucoseValue: number;
  timestamp: Date;
  mealContext?: string;
  notes?: string;
}

/**
 * Calculates the estimated A1C based on an array of glucose readings
 * 
 * @param readings Array of glucose readings
 * @returns Estimated A1C value or null if insufficient data
 */
export function calculateA1C(readings: GlucoseReading[]): number | null {
  // Need at least 3 readings for a meaningful estimate
  if (!readings || readings.length < 3) {
    return null;
  }

  // Calculate average glucose
  const totalGlucose = readings.reduce((sum, reading) => sum + reading.glucoseValue, 0);
  const averageGlucose = totalGlucose / readings.length;

  // Apply the formula: A1C = (Average Glucose + 46.7) / 28.7
  const estimatedA1C = (averageGlucose + 46.7) / 28.7;

  // Round to 1 decimal place
  return Math.round(estimatedA1C * 10) / 10;
}

/**
 * Calculates the estimated average glucose (eAG) from an A1C value
 * 
 * @param a1c A1C value
 * @returns Estimated average glucose in mg/dL
 */
export function calculateAverageGlucoseFromA1C(a1c: number): number {
  // Apply the formula: Average Glucose = (A1C * 28.7) - 46.7
  const averageGlucose = (a1c * 28.7) - 46.7;
  
  // Round to nearest whole number
  return Math.round(averageGlucose);
}

/**
 * Validates if the A1C estimate is reliable based on the data quality
 * 
 * @param readings Array of glucose readings
 * @returns Object containing validation result and reason if not valid
 */
export function validateA1CEstimate(readings: GlucoseReading[]): { isValid: boolean; reason?: string } {
  if (!readings || readings.length < 3) {
    return { isValid: false, reason: 'Insufficient data. At least 3 readings are required.' };
  }

  // Check if readings span at least 7 days
  const timestamps = readings.map(r => new Date(r.timestamp).getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const daysDifference = (maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24);

  if (daysDifference < 7) {
    return { 
      isValid: false, 
      reason: 'Readings should span at least 7 days for a reliable estimate.' 
    };
  }

  // Check if there are readings from different times of day
  const morningReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 5 && hour < 11;
  });

  const afternoonReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 11 && hour < 17;
  });

  const eveningReadings = readings.filter(r => {
    const hour = new Date(r.timestamp).getHours();
    return hour >= 17 && hour < 23;
  });

  if (morningReadings.length === 0 || afternoonReadings.length === 0 || eveningReadings.length === 0) {
    return { 
      isValid: false, 
      reason: 'Readings should include different times of day (morning, afternoon, evening).' 
    };
  }

  return { isValid: true };
}

/**
 * Provides interpretation of A1C results
 * 
 * @param a1c A1C value
 * @returns Object containing interpretation and risk level
 */
export function interpretA1C(a1c: number): { interpretation: string; riskLevel: 'normal' | 'prediabetes' | 'diabetes' } {
  if (a1c < 5.7) {
    return {
      interpretation: 'Normal A1C level',
      riskLevel: 'normal'
    };
  } else if (a1c >= 5.7 && a1c < 6.5) {
    return {
      interpretation: 'Prediabetes range',
      riskLevel: 'prediabetes'
    };
  } else {
    return {
      interpretation: 'Diabetes range',
      riskLevel: 'diabetes'
    };
  }
}