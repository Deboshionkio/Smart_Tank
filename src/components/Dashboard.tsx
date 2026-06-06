import React, { useState } from 'react';
import { Plus, Settings, Fuel, Calendar, Car, Gauge, ChevronDown } from 'lucide-react';
import { UserProfile, Vehicle, FuelRecord, FuelType } from '../types';

interface DashboardProps {
  profile: UserProfile;
  records: FuelRecord[];
  activeVehicle: Vehicle;
  onRegister: () => void;
  onSettings: () => void;
  onSwitchVehicle: (vehicleId: string) => void;
}

const FUEL_BADGE: Record<FuelType, { bg: string; text: string }> = {
  Gasolina: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  Etanol: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Diesel: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Dashboard({ profile, records, activeVehicle, onRegister, onSettings, onSwitchVehicle }: DashboardProps) {
  const [vehicleMenuOpen, setVehicleMenuOpen] = useState(false);

  const now = new Date();
  const monthRecords = records.filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalMonthSpent = monthRecords.reduce((s, r) => s + r.total_paid, 0);

  const consumptionRecords = records.filter(r => r.km_per_liter !== null && !r.is_first_record);
  const avgConsumption = consumptionRecords.length > 0
    ? consumptionRecords.reduce((s, r) => s + (r.km_per_liter ?? 0), 0) / consumptionRecords.length
    : null;

  const recent = [...records]
    .sort((a, b) => b.odometer_km - a.odometer_km)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">{getGreeting()},</p>
            <h1 className="text-xl font-bold text-white mt-0.5">{profile.name.split(' ')[0]}</h1>

            {profile.vehicles.length > 1 ? (
              <button
                onClick={() => setVehicleMenuOpen(prev => !prev)}
                className="flex items-center gap-1.5 mt-1.5 group"
              >
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-300 text-xs font-medium">{activeVehicle.model} {activeVehicle.year}</span>
                <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${vehicleMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-gray-300 text-xs font-medium">{activeVehicle.model} {activeVehicle.year}</span>
              </div>
            )}

            {vehicleMenuOpen && profile.vehicles.length > 1 && (
              <div className="absolute mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl w-56 z-30">
                {profile.vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { onSwitchVehicle(v.id); setVehicleMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors ${
                      v.id === activeVehicle.id
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                        : 'text-gray-300 hover:bg-gray-700/60'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{v.model} {v.year}</span>
                    {v.id === activeVehicle.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onSettings}
            className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 pb-8 space-y-4">
        {/* Painel de Estatísticas */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-gray-400 text-xs">Média geral</span>
              </div>
              {avgConsumption !== null ? (
                <div>
                  <p className="text-3xl font-bold text-white">
                    {avgConsumption.toFixed(1).replace('.', ',')}
                  </p>
                  <p className="text-gray-400 text-xs font-medium">km/L</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-500">--</p>
                  <p className="text-gray-500 text-xs font-medium mt-1 leading-tight">Aguardando 2º abastec.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-gray-400 text-xs">Gasto no mês</span>
              </div>
              {totalMonthSpent > 0 ? (
                <div>
                  <p className="text-xl font-bold text-white leading-tight">
                    {formatCurrency(totalMonthSpent)}
                  </p>
                  <p className="text-gray-400 text-xs font-medium">{monthRecords.length} abastec.</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-gray-500">--</p>
                  <p className="text-gray-500 text-xs font-medium mt-1">Nenhum ainda</p>
                </div>
              )}
            </div>
          </div>

          {records.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Última KM registrada</span>
                <span className="font-semibold text-gray-300">
                  {[...records].sort((a, b) => b.odometer_km - a.odometer_km)[0]?.odometer_km.toLocaleString('pt-BR')} km
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botão Registrar */}
        <button
          onClick={onRegister}
          className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          Registrar Abastecimento
        </button>

        {/* Seção Últimos Abastecimentos */}
        <div className="space-y-3">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider px-1">Últimos Abastecimentos</p>
          
          {recent.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-gray-500 text-sm">Nenhum abastecimento registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((r) => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">{formatCurrency(r.total_paid)}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${FUEL_BADGE[r.fuel_type as FuelType]?.bg || 'bg-gray-800'} ${FUEL_BADGE[r.fuel_type as FuelType]?.text || 'text-gray-400'}`}>
                          {r.fuel_type}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{formatDate(r.created_at)} • {r.odometer_km.toLocaleString('pt-BR')} km</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {r.is_first_record || r.km_per_liter === null ? (
                      <p className="text-gray-400 text-[10px] font-medium bg-gray-800 px-2 py-1 rounded-md">Marco Zero</p>
                    ) : (
                      <div>
                        <p className="text-white font-bold text-sm">{r.km_per_liter.toFixed(1).replace('.', ',')}</p>
                        <p className="text-gray-400 text-[10px] font-medium">km/L</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}