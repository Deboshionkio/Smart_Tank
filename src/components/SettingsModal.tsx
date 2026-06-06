import React, { useState } from 'react';
import { X, User, Car, Download, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { UserProfile, Vehicle, FuelRecord } from '../types';

interface SettingsModalProps {
  profile: UserProfile;
  records: FuelRecord[];
  onClose: () => void;
  onClearData: () => void;
  onResetHistoryKeepLast: () => void; // Nova propriedade adicionada para o Passo 1
  onSwitchVehicle: (vehicleId: string) => void;
}

export default function SettingsModal({ 
  profile, 
  records, 
  onClose, 
  onClearData, 
  onResetHistoryKeepLast, // Recebendo a nova função
  onSwitchVehicle 
}: SettingsModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false); // Estado para o novo alerta
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const vehicleRecords = (vehicleId: string) =>
    records.filter(r => r.vehicle_id === vehicleId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 rounded-t-3xl px-6 pt-6 pb-10 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-6" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Perfil & Configurações</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{profile.name}</p>
              <p className="text-gray-400 text-xs">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Veículos</p>
          <div className="space-y-2">
            {profile.vehicles.map(v => {
              const vr = vehicleRecords(v.id);
              const totalSpent = vr.reduce((s, r) => s + r.total_paid, 0);
              return (
                <div key={v.id} className="bg-gray-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Car className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-white text-sm font-medium">{v.model} {v.year}</span>
                    {v.id === profile.activeVehicleId && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-medium ml-auto">Ativo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span>{vr.length} abastec.</span>
                    <span>R$ {totalSpent.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {v.id !== profile.activeVehicleId && profile.vehicles.length > 1 && (
                    <button
                      onClick={() => onSwitchVehicle(v.id)}
                      className="mt-2 text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors"
                    >
                      Trocar para este veículo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Resumo geral</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-white font-bold text-lg">{records.length}</p>
              <p className="text-gray-400 text-xs">Abastecimentos</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <p className="text-white font-bold text-lg">
                R$ {records.reduce((sum, r) => sum + r.total_paid, 0).toFixed(2).replace('.', ',')}
              </p>
              <p className="text-gray-400 text-xs">Total gasto</p>
            </div>
          </div>
        </div>
        
        {/* PASSO 1: NOVO BOTÃO DE RESET DO HISTÓRICO (Mantendo o perfil) */}
        <div className="space-y-3">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-amber-400 rounded-2xl p-4 flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Limpar histórico de testes</p>
                <p className="text-gray-500 text-xs">Mantém o último registro como início</p>
              </div>
            </button>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-amber-400 text-sm font-medium">Zerar dados antigos?</p>
              </div>
              <p className="text-gray-400 text-xs mb-4">Isso apagará os abastecimentos passados. O registro mais recente ficará salvo como seu novo ponto de partida.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onResetHistoryKeepLast();
                    setShowResetConfirm(false);
                  }}
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Confirmar Reset
                </button>
              </div>
            </div>
          )}

          {/* Delete data original */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-red-400 rounded-2xl p-4 flex items-center gap-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Limpar todos os dados</p>
                <p className="text-gray-500 text-xs">Remove perfil e histórico</p>
              </div>
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm font-medium">Confirmar exclusão?</p>
              </div>
              <p className="text-gray-400 text-xs mb-4">Esta ação não pode ser desfeita. Todos os seus dados serão removidos.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onClearData}
                  className="py-2.5 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Excluir tudo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
