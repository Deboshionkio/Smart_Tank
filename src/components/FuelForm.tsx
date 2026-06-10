import React, { useState } from 'react';
import { X, Fuel, Car } from 'lucide-react';
import { FuelFormData, FuelType, Vehicle } from '../types';

interface FuelFormProps {
  onClose: () => void;
  onSubmit: (data: FuelFormData) => Promise<void>;
  isLoading: boolean;
  vehicles: Vehicle[];
  defaultVehicleId: string;
}

const FUEL_TYPES: FuelType[] = ['Gasolina', 'Etanol', 'Diesel'];

export default function FuelForm({ onClose, onSubmit, isLoading, vehicles, defaultVehicleId }: FuelFormProps) {
  const [form, setForm] = useState<FuelFormData>({
    vehicle_id: defaultVehicleId,
    odometer_km: '',
    fuel_type: 'Gasolina',
    price_per_liter: '',
    total_paid: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FuelFormData | string, string>>>({});

  const handleChange = (field: keyof FuelFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const calcLiters = (): number | null => {
    const total = parseFloat(form.total_paid);
    const price = parseFloat(form.price_per_liter);
    if (!isNaN(total) && !isNaN(price) && price > 0) return total / price;
    return null;
  };

  const validate = () => {
    const errs: Partial<Record<string, string>> = {};
    if (vehicles.length > 1 && !form.vehicle_id) errs.vehicle_id = 'Selecione o veículo';
    if (!form.odometer_km || isNaN(+form.odometer_km) || +form.odometer_km <= 0)
      errs.odometer_km = 'Informe a quilometragem atual';
    if (!form.price_per_liter || isNaN(+form.price_per_liter) || +form.price_per_liter <= 0)
      errs.price_per_liter = 'Informe o preço por litro';
    if (!form.total_paid || isNaN(+form.total_paid) || +form.total_paid <= 0)
      errs.total_paid = 'Informe o valor total pago';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSubmit(form);
  };

  const liters = calcLiters();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 border-t-2 border-emerald-500 rounded-t-3xl px-6 pt-6 pb-10 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">Registrar Abastecimento</h2>
            <p className="text-gray-300 text-sm mt-1 font-medium">Preencha os dados do painel</p>
          </div>
          <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Seletor de Veículo */}
          {vehicles.length > 1 && (
            <div>
              <label className="block text-base font-bold text-gray-200 mb-2">Selecione o Veículo</label>
              <div className="space-y-2">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleChange('vehicle_id', v.id)}
                    className={`w-full flex items-center gap-3 py-4 px-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.vehicle_id === v.id ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'
                    }`}
                  >
                    <Car className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{v.model} - {v.year}</span>
                    {form.vehicle_id === v.id && <span className="ml-auto w-3 h-3 rounded-full bg-emerald-400" />}
                  </button>
                ))}
              </div>
              {errors.vehicle_id && <p className="text-red-400 text-sm font-bold mt-1.5">{errors.vehicle_id}</p>}
            </div>
          )}

          {/* KM */}
          <div>
            <label className="block text-base font-bold text-gray-200 mb-2">Quilometragem Atual (KM)</label>
            <input
              type="number"
              value={form.odometer_km}
              onChange={e => handleChange('odometer_km', e.target.value)}
              placeholder="Ex: 45320"
              className={`w-full bg-gray-800 border-2 rounded-xl px-4 py-4 text-white font-bold placeholder-gray-500 text-base outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all ${errors.odometer_km ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
            />
            {errors.odometer_km && <p className="text-red-400 text-sm font-bold mt-1.5">{errors.odometer_km}</p>}
          </div>

          {/* Combustível */}
          <div>
            <label className="block text-base font-bold text-gray-200 mb-2">Tipo de Combustível</label>
            <div className="grid grid-cols-3 gap-2">
              {FUEL_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('fuel_type', type)}
                  className={`py-4 rounded-xl text-base font-black border-2 transition-all ${
                    form.fuel_type === type ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preço por Litro */}
          <div>
            <label className="block text-base font-bold text-gray-200 mb-2">Preço por Litro (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base font-black">R$</span>
              <input
                type="number"
                value={form.price_per_liter}
                onChange={e => handleChange('price_per_liter', e.target.value)}
                placeholder="0,00"
                step="0.01"
                className={`w-full bg-gray-800 border-2 rounded-xl pl-12 pr-4 py-4 text-white font-bold placeholder-gray-500 text-base outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all ${errors.price_per_liter ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
              />
            </div>
            {errors.price_per_liter && <p className="text-red-400 text-sm font-bold mt-1.5">{errors.price_per_liter}</p>}
          </div>

          {/* Total Pago */}
          <div>
            <label className="block text-base font-bold text-gray-200 mb-2">Valor Total Pago (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base font-black">R$</span>
              <input
                type="number"
                value={form.total_paid}
                onChange={e => handleChange('total_paid', e.target.value)}
                placeholder="0,00"
                step="0.01"
                className={`w-full bg-gray-800 border-2 rounded-xl pl-12 pr-4 py-4 text-white font-bold placeholder-gray-500 text-base outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all ${errors.total_paid ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
              />
            </div>
            {errors.total_paid && <p className="text-red-400 text-sm font-bold mt-1.5">{errors.total_paid}</p>}
          </div>

          {/* Preview de Litros */}
          {liters !== null && (
            <div className="bg-emerald-500/20 border-2 border-emerald-400 rounded-xl px-4 py-4 flex items-center gap-3 shadow-md">
              <Fuel className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-white text-base font-black">
                  {liters.toFixed(2).replace('.', ',')} litros abastecidos
                </p>
                <p className="text-gray-300 text-xs font-medium">calculado automaticamente</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-gray-700 text-white font-black py-4 rounded-xl text-lg tracking-wide transition-all border-2 border-emerald-400 shadow-xl"
          >
            {isLoading ? 'SALVANDO...' : 'SALVAR ABASTECIMENTO'}
          </button>
        </form>
      </div>
    </div>
  );
}
