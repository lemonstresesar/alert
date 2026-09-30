import React, { useEffect, useState } from 'react';
import {
  fetchWeatherForecast,
  fetchCurrentWeather,
  calculateRiskFromPrecipitation,
} from '../../services/weatherService';
import { CurrentWeather, DailyWeatherForecast } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import {
  CloudRain,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Waves,
  Droplets,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';

export const CitizenForecast: React.FC = () => {
  const [forecasts, setForecasts] = useState<DailyWeatherForecast[]>([]);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyWeatherForecast | null>(null);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      const [fData, cData] = await Promise.all([
        fetchWeatherForecast(14),
        fetchCurrentWeather(),
      ]);
      setForecasts(fData);
      setCurrent(cData);
      setSelectedDay(fData[0] || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const getBarColor = (precip: number) => {
    if (precip >= 40) return '#dc2626'; // rouge critique
    if (precip >= 25) return '#f97316'; // orange élevé
    if (precip >= 10) return '#eab308'; // jaune modéré
    return '#16a34a'; // vert faible
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Modèle Hydrométéorologique Open-Meteo
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Prévisions Pluviométriques & Risques de Crues
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Projection sur 14 jours des précipitations cumulées et probabilités de saturation des bassins.
          </p>
        </div>

        <button
          onClick={loadWeatherData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold self-start md:self-auto transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Actualiser les données</span>
        </button>
      </div>

      {/* Main Graph Card with Recharts */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cumul des Pluies Quotidiennes attendues (mm)
            </h3>
            <span className="text-xs text-slate-500">
              Cliquez sur une barre pour voir le diagnostic hydrologique du jour
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-red-600"></span>
              <span>≥ 40mm (Critique)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-orange-500"></span>
              <span>25-40mm (Élevé)</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
              <span>&lt; 10mm (Faible)</span>
            </span>
          </div>
        </div>

        {/* Recharts Bar & Line Chart */}
        <div className="h-72 w-full pt-2">
          {forecasts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={forecasts}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedDay(e.activePayload[0].payload as DailyWeatherForecast);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayName"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit="mm"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyWeatherForecast;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1">
                          <div className="font-bold border-b border-slate-700 pb-1">
                            {data.dayName} {new Date(data.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div>Précipitations : <strong className="text-blue-300 font-mono">{data.precipitationSum} mm</strong></div>
                          <div>Probabilité de pluie : <strong className="text-amber-300 font-mono">{data.precipitationProbability}%</strong></div>
                          <div>Températures : <span className="font-mono">{data.tempMin}°C - {data.tempMax}°C</span></div>
                          <div className="pt-1 text-[11px] text-slate-300 font-medium capitalize">
                            Risque estimé : <span className="font-bold text-white">{data.riskLevel}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="precipitationSum"
                  radius={[6, 6, 0, 0]}
                  name="Précipitations"
                  cursor="pointer"
                >
                  {forecasts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.precipitationSum)}
                      stroke={selectedDay?.date === entry.date ? '#1e293b' : undefined}
                      strokeWidth={selectedDay?.date === entry.date ? 2 : 0}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="precipitationProbability"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  name="Probabilité (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Chargement des projections...
            </div>
          )}
        </div>
      </div>

      {/* Selected Day Focus & Weekly Analysis */}
      {selectedDay && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Diagnostic Météo Détaillé
              </span>
              <RiskBadge level={selectedDay.riskLevel} size="sm" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {selectedDay.dayName} {new Date(selectedDay.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {selectedDay.recommendation}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Précipitations 24h</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                  {selectedDay.precipitationSum} mm
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Probabilité d'averse</span>
                <span className="text-base font-bold text-blue-600 font-mono mt-0.5 block">
                  {selectedDay.precipitationProbability}%
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Températures</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
                  {selectedDay.tempMin}° / {selectedDay.tempMax}°C
                </span>
              </div>
            </div>
          </div>

          {/* Marée & Écosystème Wouri */}
          <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>Facteur Marée du Wouri</span>
              </div>
              <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                À Douala, l'effet combiné des marées d'équinoxe dans l'estuaire du Wouri empêche l'évacuation des bassins versants de Bépanda, Makèpé et Deido vers la mer.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">Conseil de navigation urbaine</div>
              <p className="text-[11px] text-slate-600">
                Évitez d'emprunter l'Axe Lourd Bonabéri-Bessenguè pendant les 2 heures entourant la pleine mer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
