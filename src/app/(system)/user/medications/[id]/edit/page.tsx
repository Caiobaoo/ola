"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { ChevronDown } from "lucide-react";

export default function EditPrescriptionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const { data: prescription, isLoading } = api.prescription.getAllPrescriptions.useQuery(
    { clerkId: user?.id ?? "" },
    { enabled: !!user?.id }
  );

  const found = prescription?.find((p) => p.id === id);

  const updateMutation = api.prescription.updatePrescription.useMutation({
    onSuccess: () => {
      alert("Prescrição atualizada com sucesso!");
      router.push("/user/medications");
    },
  });

  const [formData, setFormData] = useState({
    prescriptionId: "",
    clerkId: user?.id ?? "",
    doctorName: "",
    doctorCRM: "",
    especialidade: "",
    observacao: "",
    dataPrescricao: "",
  });

  const [medications, setMedications] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (found) {
      setFormData({
        prescriptionId: found.id,
        clerkId: found.clerkId,
        doctorName: found.doctorName,
        doctorCRM: found.doctorCRM,
        especialidade: found.especialidade ?? "",
        observacao: found.observacao ?? "",
        dataPrescricao: found.dataPrescricao?.toISOString().split("T")[0] ?? "",
      });
      setMedications(
        found.medications?.map((m) => ({
          nomeMedicamento: m.nomeMedicamento,
          dosagem: m.dosagem,
          unidadeDosagem: m.unidadeDosagem,
          viaAdministracao: m.viaAdministracao,
          frequenciaUso: m.frequenciaUso,
          duracaoTratamento: m.duracaoTratamento,
          unidadeDuracao: m.unidadeDuracao,
          dataInicioTratamento: m.dataInicioTratamento ? new Date(m.dataInicioTratamento).toISOString().split("T")[0] : "",
          horarioInicio: m.horarioInicio ?? "",
        })) ?? []
      );
    }
  }, [found]);

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      ...formData,
      medications,
    });
  };

  const handleBack = () => {
    router.back();
  };

  if (!found || isLoading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex items-center gap-1 mb-6">
        <button onClick={handleBack} className="text-black font-semibold">←</button>
        <span className="font-semibold">Receita</span>
      </div>

      <div className="bg-purple-100 px-4 py-3 rounded-2xl mb-2 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
        <div className="flex items-center justify-between">
          <span className="text-purple-700 font-medium">Informações da prescrição</span>
          <ChevronDown className={`text-purple-700 w-4 h-4 transition-transform duration-200 ${showInfo ? "rotate-180" : "-rotate-90"}`} />
        </div>
      </div>

      {showInfo && (
        <div className="space-y-4 mb-4">
          <div className="bg-purple-100 p-4 rounded-2xl">
            <label className="block text-sm font-semibold text-purple-700 mb-1">Nome do médico</label>
            <Input className="rounded-full placeholder:text-gray-500" placeholder="Informe o nome do seu médico" value={formData.doctorName} onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })} />
          </div>
          <div className="bg-purple-100 p-4 rounded-2xl">
            <label className="block text-sm font-semibold text-purple-700 mb-1">CRM</label>
            <Input className="rounded-full placeholder:text-gray-500" placeholder="Informe o CRM" value={formData.doctorCRM} onChange={(e) => setFormData({ ...formData, doctorCRM: e.target.value })} />
          </div>
          <div className="bg-purple-100 p-4 rounded-2xl">
            <label className="block text-sm font-semibold text-purple-700 mb-1">Especialidade</label>
            <Input className="rounded-full placeholder:text-gray-500" placeholder="Informe a especialidade" value={formData.especialidade} onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })} />
          </div>
          <div className="bg-purple-100 p-4 rounded-2xl">
            <label className="block text-sm font-semibold text-purple-700 mb-1">Observação</label>
            <Input className="rounded-full placeholder:text-gray-500" placeholder="Digite uma observação" value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
          </div>
          <div className="bg-purple-100 p-4 rounded-2xl">
            <label className="block text-sm font-semibold text-purple-700 mb-1">Data da prescrição</label>
            <Input className="rounded-full" type="date" value={formData.dataPrescricao} onChange={(e) => setFormData({ ...formData, dataPrescricao: e.target.value })} />
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2">Medicações prescritas</h3>

      {medications.map((med, index) => {
        const isExpanded = expandedIndex === index;
        return (
          <div key={index} className="mb-4">
            <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
              <span className="font-semibold text-blue-600">{med.nomeMedicamento}</span>
              <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${isExpanded ? "rotate-180" : "-rotate-90"}`} />
            </div>

            {isExpanded && (
              <div className="space-y-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Nome do medicamento</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Nome do medicamento" value={med.nomeMedicamento} onChange={(e) => handleMedicationChange(index, "nomeMedicamento", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Dosagem</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Dosagem" value={med.dosagem} onChange={(e) => handleMedicationChange(index, "dosagem", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Unidade de dosagem</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Ex: mg, comprimido" value={med.unidadeDosagem} onChange={(e) => handleMedicationChange(index, "unidadeDosagem", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Via de administração</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Ex: oral, injetável" value={med.viaAdministracao} onChange={(e) => handleMedicationChange(index, "viaAdministracao", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Frequência</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Ex: 1 vez ao dia" value={med.frequenciaUso} onChange={(e) => handleMedicationChange(index, "frequenciaUso", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Duração do tratamento</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Ex: 3" value={med.duracaoTratamento} onChange={(e) => handleMedicationChange(index, "duracaoTratamento", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Unidade de duração</label>
                  <Input className="rounded-full placeholder:text-gray-500" placeholder="Ex: semanas, meses" value={med.unidadeDuracao} onChange={(e) => handleMedicationChange(index, "unidadeDuracao", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Data de início</label>
                  <Input className="rounded-full" type="date" value={med.dataInicioTratamento} onChange={(e) => handleMedicationChange(index, "dataInicioTratamento", e.target.value)} />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-600 mb-1">Horário de início</label>
                  <Input className="rounded-full" type="time" value={med.horarioInicio} onChange={(e) => handleMedicationChange(index, "horarioInicio", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-end mt-6">
        <Button onClick={handleUpdate} className="bg-black text-white rounded-full">Salvar Alterações</Button>
      </div>
    </div>
  );
}