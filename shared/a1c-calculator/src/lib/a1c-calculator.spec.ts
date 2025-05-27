import { 
  calculateA1C, 
  calculateAverageGlucoseFromA1C, 
  validateA1CEstimate, 
  interpretA1C,
  GlucoseReading 
} from './a1c-calculator';

describe('A1C Calculator', () => {
  describe('calculateA1C', () => {
    it('should return null for insufficient data', () => {
      const readings: GlucoseReading[] = [
        { glucoseValue: 120, timestamp: new Date() }
      ];
      expect(calculateA1C(readings)).toBeNull();
    });

    it('should calculate A1C correctly from glucose readings', () => {
      const readings: GlucoseReading[] = [
        { glucoseValue: 100, timestamp: new Date() },
        { glucoseValue: 120, timestamp: new Date() },
        { glucoseValue: 140, timestamp: new Date() },
        { glucoseValue: 160, timestamp: new Date() },
        { glucoseValue: 180, timestamp: new Date() }
      ];
      // Average glucose = 140
      // A1C = (140 + 46.7) / 28.7 = 6.5
      expect(calculateA1C(readings)).toBeCloseTo(6.5, 1);
    });

    it('should handle edge cases with very high glucose values', () => {
      const readings: GlucoseReading[] = [
        { glucoseValue: 200, timestamp: new Date() },
        { glucoseValue: 250, timestamp: new Date() },
        { glucoseValue: 300, timestamp: new Date() }
      ];
      // Average glucose = 250
      // A1C = (250 + 46.7) / 28.7 = 10.3
      expect(calculateA1C(readings)).toBeCloseTo(10.3, 1);
    });
  });

  describe('calculateAverageGlucoseFromA1C', () => {
    it('should calculate average glucose correctly from A1C', () => {
      // For A1C = 7.0
      // Average Glucose = (7.0 * 28.7) - 46.7 = 154.2
      expect(calculateAverageGlucoseFromA1C(7.0)).toBeCloseTo(154, 0);
    });

    it('should handle edge cases with low A1C values', () => {
      // For A1C = 5.0
      // Average Glucose = (5.0 * 28.7) - 46.7 = 96.8
      expect(calculateAverageGlucoseFromA1C(5.0)).toBeCloseTo(97, 0);
    });

    it('should handle edge cases with high A1C values', () => {
      // For A1C = 12.0
      // Average Glucose = (12.0 * 28.7) - 46.7 = 297.7
      expect(calculateAverageGlucoseFromA1C(12.0)).toBeCloseTo(298, 0);
    });
  });

  describe('validateA1CEstimate', () => {
    it('should return invalid for insufficient data', () => {
      const readings: GlucoseReading[] = [
        { glucoseValue: 120, timestamp: new Date() }
      ];
      const result = validateA1CEstimate(readings);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Insufficient data');
    });

    it('should return invalid if readings span less than 7 days', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const readings: GlucoseReading[] = [
        { glucoseValue: 120, timestamp: now },
        { glucoseValue: 130, timestamp: yesterday },
        { glucoseValue: 140, timestamp: twoDaysAgo }
      ];
      
      const result = validateA1CEstimate(readings);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('span at least 7 days');
    });

    it('should return invalid if readings do not cover different times of day', () => {
      const now = new Date();
      now.setHours(8, 0, 0); // Morning
      
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(8, 0, 0); // Morning
      
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      fourteenDaysAgo.setHours(8, 0, 0); // Morning
      
      const readings: GlucoseReading[] = [
        { glucoseValue: 120, timestamp: now },
        { glucoseValue: 130, timestamp: sevenDaysAgo },
        { glucoseValue: 140, timestamp: fourteenDaysAgo }
      ];
      
      const result = validateA1CEstimate(readings);
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('different times of day');
    });

    it('should return valid for good quality data', () => {
      const morning = new Date();
      morning.setHours(8, 0, 0);
      
      const afternoon = new Date();
      afternoon.setHours(14, 0, 0);
      
      const evening = new Date();
      evening.setHours(20, 0, 0);
      
      const sevenDaysAgo = new Date(morning);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const readings: GlucoseReading[] = [
        { glucoseValue: 120, timestamp: morning },
        { glucoseValue: 130, timestamp: afternoon },
        { glucoseValue: 140, timestamp: evening },
        { glucoseValue: 125, timestamp: sevenDaysAgo }
      ];
      
      const result = validateA1CEstimate(readings);
      expect(result.isValid).toBe(true);
    });
  });

  describe('interpretA1C', () => {
    it('should interpret normal A1C levels correctly', () => {
      const result = interpretA1C(5.5);
      expect(result.interpretation).toContain('Normal');
      expect(result.riskLevel).toBe('normal');
    });

    it('should interpret prediabetes A1C levels correctly', () => {
      const result = interpretA1C(6.0);
      expect(result.interpretation).toContain('Prediabetes');
      expect(result.riskLevel).toBe('prediabetes');
    });

    it('should interpret diabetes A1C levels correctly', () => {
      const result = interpretA1C(7.0);
      expect(result.interpretation).toContain('Diabetes');
      expect(result.riskLevel).toBe('diabetes');
    });
  });
});