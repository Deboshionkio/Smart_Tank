import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Vehicle, FuelRecord, FuelFormData } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import FuelForm from './components/FuelForm';
import SettingsModal from './components/SettingsModal';

const PROFILE_KEY = 'smart_tank_profile';
const RECORDS_KEY = 'smart_tank_fuel_records'; // Nova chave para salvar abastecimentos no celular

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega Perfil e Abastecimentos salvos localmente no celular
  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    const storedRecords = localStorage.getItem(RECORDS_KEY);

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile) as UserProfile;
      
      // Migração: garante que o array de veículos existe
      if (!parsedProfile.vehicles) {
        parsedProfile.vehicles = [{ id: 'v1', model: parsedProfile.carModel ?? '', year: parsedProfile.carYear ?? '' }];
        parsedProfile.activeVehicleId = 'v1';
        localStorage.setItem(PROFILE_KEY, JSON.stringify(parsedProfile));
      }
      
      setProfile(parsedProfile);

      if (storedRecords) {
        setRecords(JSON.parse(storedRecords) as FuelRecord[]);
      }
    }
    setIsLoading(false);
  }, []);

  const saveProfile = (p: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  };

  const handleOnboardingComplete = (p: UserProfile) => {
    saveProfile(p);
    setRecords([]);
    localStorage.setItem(RECORDS_KEY, JSON.stringify([]));
    setIsLoading(false);
  };

  const handleSwitchVehicle = (vehicleId: string) => {
    if (!profile || profile.activeVehicleId === vehicleId) return;
    const updated = { ...profile, activeVehicleId: vehicleId };
    saveProfile(updated);
  };

  const activeVehicle = profile?.vehicles.find(v => v.id === profile.activeVehicleId) ?? profile?.vehicles[0];
  const vehicleRecords = records.filter(r => r.vehicle_id === (activeVehicle?.id ?? ''));

  // LÓGICA DE SUBMISSÃO E CÁLCULO DE MÉDIA CORRIGIDA
  const handleFuelSubmit = useCallback(async (formData: FuelFormData) => {
    if (!profile) return;
    setIsSubmitting(true);

    try {
      const odometerKm = parseFloat(formData.odometer_km);
      const pricePerLiter = parseFloat(formData.price_per_liter);
      const totalPaid = parseFloat(formData.total_paid);
      const liters = totalPaid / pricePerLiter;

      // Filtra e ordena estritamente por quilometragem para pegar o anterior real deste veículo
      const sortedVehicleRecords = [...records]
        .filter(r => r.vehicle_id === formData.vehicle_id)
        .sort((a, b) => b.odometer_km - a.odometer_km);
      
      const lastRecordForVehicle = sortedVehicleRecords[0] ?? null;

      let kmPerLiter: number | null = null;
      let distanceKm: number | null = null;
      let isFirstRecord = false;

      // MATEMÁTICA CORRIGIDA: Se não houver anterior ou KM for igual, vira ponto de partida sem erro
      if (!lastRecordForVehicle || odometerKm <= lastRecordForVehicle.odometer_km) {
        isFirstRecord = true;
      } else {
        distanceKm = odometerKm - lastRecordForVehicle.odometer_km;
        if (distanceKm > 0 && liters > 0) {
          kmPerLiter = distanceKm / liters;
        }
      }

      // Cria a nova estrutura com ID local temporário e data atual estável
      const newRecord: FuelRecord = {
        id: Math.random().toString(36).substring(2, 9),
        created_at: new Date().toISOString(),
        user_email: profile.email,
        vehicle_id: formData.vehicle_id,
        odometer_km: odometerKm,
        fuel_type: formData.fuel_type,
        price_per_liter: pricePerLiter,
        total_paid: totalPaid,
        liters,
        km_per_liter: kmPerLiter,
        distance_km: distanceKm,
        is_first_record: isFirstRecord,
      };

      const updatedRecords = [newRecord, ...records];
      setRecords(updatedRecords);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [profile, records]);

  // PASSO 1 COMPLETO: Função de Reset mantendo apenas o último registro ativo
  const handleResetHistoryKeepLast = () => {
    if (records.length <= 1) return;

    // Pega o registro com a maior quilometragem atualizado para ser o novo marco zero
    const sorted = [...records].sort((a, b) => b.odometer_km - a.odometer_km);
    const lastRecord = sorted[0];

    // Transforma ele em primeiro registro (reseta a média antiga)
    const resetedRecord: FuelRecord = {
      ...lastRecord,
      km_per_liter: null,
      distance_km: null,
      is_first_record: true
    };

    const newHistory = [resetedRecord];
    setRecords(newHistory);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(newHistory));
    setShowSettings(false);
  };

  // Limpa perfil e dados locais por completo
  const handleClearData = () => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(RECORDS_KEY);
    setProfile(null);
    setRecords([]);
    setShowSettings(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando dados locais...</p>
        </div>
      </div>
    );
  }

  if (!profile || !activeVehicle) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Dashboard
        profile={profile}
        records={vehicleRecords}
        activeVehicle={activeVehicle}
        onRegister={() => setShowForm(true)}
        onSettings={() => setShowSettings(true)}
        onSwitchVehicle={handleSwitchVehicle}
      />

      {showForm && (
        <FuelForm
          onClose={() => setShowForm(false)}
          onSubmit={handleFuelSubmit}
          isLoading={isSubmitting}
          vehicles={profile.vehicles}
          defaultVehicleId={profile.activeVehicleId}
        />
      )}

      {showSettings && (
        <SettingsModal
          profile={profile}
          records={records}
          onClose={() => setShowSettings(false)}
          onClearData={handleClearData}
          onResetHistoryKeepLast={handleResetHistoryKeepLast} // Passando a nova função para o botão
          onSwitchVehicle={(vehicleId) => { handleSwitchVehicle(vehicleId); setShowSettings(false); }}
        />
      )}
    </div>
  );
}
