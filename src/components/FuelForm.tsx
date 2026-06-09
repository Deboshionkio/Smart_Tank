import React, { useState, useEffect } from 'react';
import { X, Fuel, Car, Camera, AlertCircle } from 'lucide-react';
import { FuelFormData, FuelType, Vehicle } from '../types';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

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

  // Lógica inteligente de varredura offline do link do QR Code da NFC-e
  const parseQrCodeUrl = (url: string) => {
    try {
      let foundData = false;

      // 1. Procura o valor total pago (vTo ou vNF no link da SEFAZ)
      const totalMatch = url.match(/[?&](vTo|vNF)=([^&]+)/i);
      if (totalMatch && totalMatch[2]) {
        handleChange('total_paid', parseFloat(totalMatch[2]).toString());
        foundData = true;
      }

      // 2. Procura o preço por litro caso o estado forneça direto no link (pLitr ou pCumb)
      const priceMatch = url.match(/[?&](pLitr|pCumb|vSeg)=([^&]+)/i);
      if (priceMatch && priceMatch[2]) {
        handleChange('price_per_liter', parseFloat(priceMatch[2]).toString());
      }

      // 3. Identifica o tipo de combustível se houver palavras-chave na URL
      if (url.toLowerCase().includes('etanol') || url.toLowerCase().includes('alcool')) {
        handleChange('fuel_type', 'Etanol');
      } else if (url.toLowerCase().includes('diesel')) {
        handleChange('fuel_type', 'Diesel');
      } else {
        handleChange('fuel_type', 'Gasolina');
      }

      setShowScanner(false);
      setScannerError(null);
    } catch (err) {
      setScannerError("Não foi possível extrair os dados deste cupom automaticamente.");
    }
  };

  // Ativa e controla a câmera nativa do celular através do html5-qrcode
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showScanner) {
      setScannerError(null);
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          parseQrCodeUrl(decodedText);
          if (scanner) scanner.clear();
        },
        (error) => {
          // Silencia erros normais de foco da câmera em movimento
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Erro ao desligar camera", err));
      }
    };
  }, [showScanner]);

  const validate = () => {
    const errs: Partial<Record<string, string>> = {};
    if (vehicles.length > 1 && !form.vehicle_id) errs.vehicle_id = 'Selecione um veículo';
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 rounded-t-3xl px-6 pt-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Registrar Abastecimento</h2>
            <p className="text-gray-400 text-xs mt-0.5">Preencha ou escaneie o cupom do posto</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CÂMERA DO LEITOR */}
        <div className="mb-4">
          {!showScanner ? (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-emerald-400 font-medium py-3 px-4 rounded-xl border border-dashed border-emerald-500/40 flex items-center justify-center gap-2 text-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              Escanear Cupom Fiscal (Câmera)
            </button>
          ) : (
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 relative">
              <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />
              <button
                type="button"
                onClick={() => setShowScanner(false)}
                className="mt-3 w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-2 rounded-lg transition-colors"
              >
                Fechar Câmera
              </button>
            </div>
          )}

          {scannerError && (
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Veículo */}
          {vehicles.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Veículo
              </label>
              <div className="space-y-2">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleChange('vehicle_id', v.id)}
                    className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      form.vehicle_id === v.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Car className="w-4 h-4 flex-shrink-0" />
                    <span>{v.model} {v.year}</span>
                    {form.vehicle_id === v.id && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
              {errors.vehicle_id && <p className="text-red-400 text-xs mt-1">{errors.vehicle_id}</p>}
            </div>
          )}

          {/* Quilometragem */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Quilometragem atual (KM)
            </label>
            <input
              type="number"
              value={form.odometer_km}
              onChange={e => handleChange('odometer_km', e.target.value)}
              placeholder="Ex: 45320"
              min="0"
              className={`w-full bg-gray-800 border rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.odometer_km ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
            />
            {errors.odometer_km && <p className="text-red-400 text-xs mt-1">{errors.odometer_km}</p>}
          </div>

          {/* Combustível */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Tipo de combustível
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FUEL_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('fuel_type', type)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                    form.fuel_type === type
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Preço por Litro */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Preço por litro (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
              <input
                type="number"
                value={form.price_per_liter}
                onChange={e => handleChange('price_per_liter', e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className={`w-full bg-gray-800 border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.price_per_liter ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
              />
            </div>
            {errors.price_per_liter && <p className="text-red-400 text-xs mt-1">{errors.price_per_liter}</p>}
          </div>

          {/* Total Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Valor total pago (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
              <input
                type="number"
                value={form.total_paid}
                onChange={e => handleChange('total_paid', e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className={`w-full bg-gray-800 border rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${errors.total_paid ? 'border-red-500' : 'border-gray-700 focus:border-emerald-500'}`}
              />
            </div>
            {errors.total_paid && <p className="text-red-400 text-xs mt-1">{errors.total_paid}</p>}
          </div>

          {/* Preview de Litros */}
          {liters !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <Fuel className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 text-sm font-medium">
                  {liters.toFixed(2).replace('.', ',')} litros abastecidos
                </p>
                <p className="text-gray-400 text-xs">calculado automaticamente</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
          >
            {isLoading ? 'Salvando...' : 'Salvar Abastecimento'}
          </button>
        </form>
      </div>
    </div>
  );
}
