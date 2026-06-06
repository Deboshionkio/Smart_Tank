import React, { useState } from 'react';
import { Fuel, ChevronRight, Plus, Car, X } from 'lucide-react';
import { UserProfile, Vehicle } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const MAX_VEHICLES = 3;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ id: 'v1', model: '', year: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addVehicle = () => {
    if (vehicles.length >= MAX_VEHICLES) return;
    setVehicles(prev => [...prev, { id: `v${prev.length + 1}`, model: '', year: '' }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length <= 1) return;
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const updateVehicle = (index: number, field: 'model' | 'year', value: string) => {
    setVehicles(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
    const errKey = `vehicle_${index}_${field}`;
    if (errors[errKey]) setErrors(prev => { const next = { ...prev }; delete next[errKey]; return next; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Informe seu nome';
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    vehicles.forEach((v, i) => {
      if (!v.model.trim()) e[`vehicle_${i}_model`] = 'Informe o modelo';
      if (!v.year.trim()) e[`vehicle_${i}_year`] = 'Informe o ano';
      else if (!/^\d{4}$/.test(v.year) || +v.year < 1970 || +v.year > 2030)
        e[`vehicle_${i}_year`] = 'Ano invalido';
    });
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onComplete({
      name: name.trim(),
      email: '',
      vehicles,
      activeVehicleId: vehicles[0].id,
    });
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-gray-900 border rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${hasError ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <Fuel className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Tank</h1>
          <p className="text-gray-400 text-sm mt-1">Controle inteligente de combustivel</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 rounded-full bg-emerald-500" />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-emerald-500' : 'bg-gray-700'}`} />
        </div>

        {step === 1 ? (
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Bem-vindo!</h2>
            <p className="text-gray-400 text-sm mb-6">Vamos configurar seu perfil</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }}
                  placeholder="Seu nome completo"
                  className={inputClass(!!errors.name)}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

            </div>

            <button
              onClick={handleNext}
              className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Proximo
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-0.5">Seus veiculos</h2>
                <p className="text-gray-400 text-sm">Cadastre ate {MAX_VEHICLES} veiculos</p>
              </div>
              <span className="text-xs font-semibold bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg">
                {vehicles.length}/{MAX_VEHICLES}
              </span>
            </div>

            <div className="space-y-4">
              {vehicles.map((v, i) => (
                <div key={v.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">
                        {vehicles.length > 1 ? `Veiculo ${i + 1}` : 'Veiculo'}
                      </span>
                    </div>
                    {vehicles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVehicle(i)}
                        className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={v.model}
                        onChange={e => updateVehicle(i, 'model', e.target.value)}
                        placeholder="Modelo (Ex: Honda Civic)"
                        className={inputClass(!!errors[`vehicle_${i}_model`])}
                      />
                      {errors[`vehicle_${i}_model`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`vehicle_${i}_model`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        value={v.year}
                        onChange={e => updateVehicle(i, 'year', e.target.value)}
                        placeholder="Ano (Ex: 2020)"
                        min="1970"
                        max="2030"
                        className={inputClass(!!errors[`vehicle_${i}_year`])}
                      />
                      {errors[`vehicle_${i}_year`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`vehicle_${i}_year`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {vehicles.length < MAX_VEHICLES && (
              <button
                type="button"
                onClick={addVehicle}
                className="w-full mt-4 border border-dashed border-gray-700 hover:border-emerald-500/50 rounded-xl py-3.5 flex items-center justify-center gap-2 text-gray-500 hover:text-emerald-400 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar veiculo
              </button>
            )}

            <button
              type="submit"
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Comecar
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-3 text-gray-400 hover:text-gray-300 text-sm py-2 transition-colors"
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
