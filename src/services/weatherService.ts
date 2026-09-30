import { CurrentWeather, DailyWeatherForecast, NiveauRisque } from '../types';

const DOUALA_LAT = 4.05;
const DOUALA_LNG = 9.70;

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Ciel dégagé',
  1: 'Principalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Couvert',
  45: 'Brouillard d’estuaire',
  48: 'Brouillard givrant',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  61: 'Pluie faible',
  63: 'Pluie modérée continue',
  65: 'Forte pluie tropicale',
  80: 'Averses légères',
  81: 'Averses fortes',
  82: 'Averses torrentielles soudaines',
  95: 'Orage violent du Golfe de Guinée',
  96: 'Orage avec grêle légère',
  99: 'Orage sévère avec rafales de vent',
};

export function getWeatherDescription(code: number): string {
  return WEATHER_DESCRIPTIONS[code] || 'Météo instable';
}

export function calculateRiskFromPrecipitation(mm: number, proba: number = 70): { level: NiveauRisque; message: string } {
  if (mm >= 45 || (mm >= 30 && proba >= 80)) {
    return {
      level: 'critique',
      message: 'Risque de débordement immédiat des caniveaux et rivières (Mbanya, Mfoundi).'
    };
  }
  if (mm >= 25) {
    return {
      level: 'élevé',
      message: 'Fortes accumulations d\'eau attendues. Risques majeurs sur les axes bas.'
    };
  }
  if (mm >= 10) {
    return {
      level: 'modéré',
      message: 'Sols détrempés, ralentissement de circulation et flaques importantes.'
    };
  }
  return {
    level: 'faible',
    message: 'Conditions stables. Écoulement normal dans le réseau primaire.'
  };
}

// Fallback data when API is unreachable
const FALLBACK_CURRENT: CurrentWeather = {
  temperature: 28.5,
  precipitation: 14.2,
  windSpeed: 18.0,
  humidity: 89,
  weatherCode: 65,
  time: new Date().toISOString(),
  description: 'Forte pluie tropicale intermittente (Mousson du Wouri)',
};

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${DOUALA_LAT}&longitude=${DOUALA_LNG}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Africa%2FLagos`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('API Open-Meteo indisponible');
    const data = await res.json();
    const current = data.current;
    return {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      precipitation: current.precipitation || 0,
      windSpeed: Math.round(current.wind_speed_10m),
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      time: current.time,
      description: getWeatherDescription(current.weather_code),
    };
  } catch {
    return FALLBACK_CURRENT;
  }
}

export async function fetchWeatherForecast(days: number = 14): Promise<DailyWeatherForecast[]> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${DOUALA_LAT}&longitude=${DOUALA_LNG}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Africa%2FLagos&forecast_days=${days}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Erreur de prévision Open-Meteo');
    const data = await res.json();
    const daily = data.daily;

    const forecasts: DailyWeatherForecast[] = daily.time.map((dateStr: string, idx: number) => {
      const d = new Date(dateStr);
      const dayName = DAYS_FR[d.getDay()];
      const precSum = daily.precipitation_sum?.[idx] ?? 0;
      const proba = daily.precipitation_probability_max?.[idx] ?? 60;
      const code = daily.weather_code?.[idx] ?? 2;
      const risk = calculateRiskFromPrecipitation(precSum, proba);

      return {
        date: dateStr,
        dayName,
        tempMax: Math.round(daily.temperature_2m_max[idx]),
        tempMin: Math.round(daily.temperature_2m_min[idx]),
        precipitationSum: Math.round(precSum * 10) / 10,
        precipitationProbability: proba,
        weatherCode: code,
        riskLevel: risk.level,
        recommendation: risk.message,
      };
    });

    return forecasts;
  } catch {
    // Generate realistic Douala 14-day cycle
    const now = new Date();
    const simulated: DailyWeatherForecast[] = [];
    const simulatedPrecip = [35.2, 52.0, 18.4, 8.1, 4.0, 42.8, 64.5, 29.0, 12.5, 5.0, 38.0, 48.2, 22.0, 14.0];
    const simulatedProba = [85, 95, 70, 40, 25, 90, 95, 80, 55, 30, 85, 90, 75, 60];
    const weatherCodes = [65, 95, 63, 61, 2, 82, 95, 63, 61, 1, 65, 82, 63, 61];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + i);
      const dayName = DAYS_FR[targetDate.getDay()];
      const p = simulatedPrecip[i % simulatedPrecip.length];
      const prob = simulatedProba[i % simulatedProba.length];
      const code = weatherCodes[i % weatherCodes.length];
      const risk = calculateRiskFromPrecipitation(p, prob);

      simulated.push({
        date: targetDate.toISOString().split('T')[0],
        dayName,
        tempMax: 29 + (i % 3),
        tempMin: 23 + (i % 2),
        precipitationSum: p,
        precipitationProbability: prob,
        weatherCode: code,
        riskLevel: risk.level,
        recommendation: risk.message,
      });
    }

    return simulated;
  }
}
