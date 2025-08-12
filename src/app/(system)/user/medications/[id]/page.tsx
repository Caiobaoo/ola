"use client";

import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Loader2,
  Download,
  Calendar,
  Pencil,
  Power,
  ChevronDown,
  Droplet,
  AlertTriangle,
  HeartPulse,
  Pill,
  Syringe,
  BarChart2,
  Timer,
  CalendarDays,
  Clock
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Prescription } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import GenerateRelatorioButton from "~/components/ui/GenerateRelatorioButton";

export default function PrescriptionDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const utils = api.useUtils();
  const { user } = useUser();
  const clerkId = user?.id ?? "";
  const [showPatientInfo, setShowPatientInfo] = useState(false);

  const { data: prescriptions, isLoading, refetch } = api.prescription.getAllPrescriptions.useQuery(
    { clerkId },
    { enabled: !!clerkId }
  );

  const { data: userData } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    { enabled: !!clerkId }
  );

  const foundPrescription = prescriptions?.find((p: Prescription) => p.id === id);

  const inactivateMutation = api.prescription.inactivatePrescription.useMutation({
    onSuccess: async () => {
      await utils.prescription.invalidate();
      await refetch();
      router.push("/user/medications");
    },
  });

  const activateMutation = api.prescription.activatePrescription.useMutation({
    onSuccess: async () => {
      await utils.prescription.invalidate();
      await refetch();
      router.refresh();
    },
  });

  const handleUpdate = () => {
    router.push(`/user/medications/${id}/edit`);
  };

  const handleDisable = () => {
    if (id) inactivateMutation.mutate({ prescriptionId: String(id) });
  };

  const handleActivate = () => {
    if (id) activateMutation.mutate({ prescriptionId: String(id) });
  };

  const handleBack = () => router.back();

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (isLoading || !foundPrescription) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2">Carregando prescrição...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button onClick={handleBack} className="text-black font-semibold">←</button>
          <span className="font-semibold">Receita</span>
        </div>
        <div className="flex gap-2">
        <GenerateRelatorioButton
          prescription={{
            ...foundPrescription,
            dataPrescricao: foundPrescription.dataPrescricao ?? new Date(),
            medications: foundPrescription.medications.map((med) => ({
              ...med,
              duracaoTratamento: med.duracaoTratamento ?? undefined,
              unidadeDuracao: med.unidadeDuracao ?? undefined,
              dataInicioTratamento: med.dataInicioTratamento ?? undefined,
              horarioInicio: med.horarioInicio ?? undefined,
            })),
          }}
          userData={{
            ...userData!,
            nomecompleto: userData?.nomecompleto ?? undefined,
          }}
          className="text-purple-700 border border-purple-300 rounded-xl"
        />
         
          {foundPrescription.ativo ? (
            <>
              <Button variant="ghost" size="icon" className="text-blue-600 border border-blue-300 rounded-xl" onClick={handleUpdate}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-600 border border-red-300 rounded-xl" onClick={handleDisable}>
                <Power className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="text-green-600 border border-green-300 rounded-xl" onClick={handleActivate}>
              <Power className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-start mb-3">
        <span className="flex items-center gap-1 text-sm font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          <Calendar className="w-4 h-4" />
          Data da receita: {foundPrescription.dataPrescricao && new Date(foundPrescription.dataPrescricao).toLocaleDateString()}
        </span>
      </div>

      <div className="bg-cyan-400 p-4 rounded-2xl flex items-start gap-4 mb-4 text-white">
        <Image src="/img/receita.png" alt="Doctor" width={48} height={48} className="rounded-full" />
        <div>
          <p className="font-semibold text-white">Dr. {foundPrescription.doctorName}</p>
          <p className="text-sm">{foundPrescription.especialidade}</p>
          <p className="text-sm">CRM {foundPrescription.doctorCRM}</p>
        </div>
      </div>

      {userData && (
        <>
          <div
            className="bg-purple-100 px-4 py-3 rounded-2xl mb-2 cursor-pointer"
            onClick={() => setShowPatientInfo(!showPatientInfo)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={userData.genero === "feminino" ? "/img/feminino.png" : "/img/masculino.png"}
                  alt="Paciente"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="text-purple-700 font-medium">Informações do paciente</span>
              </div>
              <ChevronDown
                className={`text-purple-700 w-4 h-4 transition-transform duration-200 ${
                  showPatientInfo ? "rotate-180" : "-rotate-90"
                }`}
              />
            </div>
          </div>

          {showPatientInfo && (
            <div className="mb-4">
              <p className="mb-2 font-semibold">
                <strong>Nome:</strong> {userData.nomecompleto}
              </p>
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 bg-purple-200 text-sm text-gray-800 px-4 py-2 rounded-full w-full">
                  <Droplet size={18} className="text-purple-700" />
                  Tipo sanguíneo: {userData.tipoSanguineo}
                </span>
                {userData.doencas.length > 0 && (
                  <span className="flex items-center gap-2 bg-purple-200 text-sm text-gray-800 px-4 py-2 rounded-full w-full">
                    <HeartPulse size={18} className="text-purple-700" />
                    Doenças pré-existentes: {userData.doencas.join(", ")}
                  </span>
                )}
                {userData.alergias.length > 0 && (
                  <span className="flex items-center gap-2 bg-purple-200 text-sm text-gray-800 px-4 py-2 rounded-full w-full">
                    <AlertTriangle size={18} className="text-purple-700" />
                    Alérgico(a): {userData.alergias.join(", ")}
                  </span>
                )}
              </div>
          </div>
           
          )}
        </>
      )}


    <h2 className="text-lg font-semibold mb-3">Medicações receitadas</h2>


    <div className="space-y-4">
      {foundPrescription.medications?.map((med, index) => {
        const isExpanded = expandedIndex === index;
        return (
          <div key={index}>
            <div
              className="bg-blue-50 px-4 py-3 rounded-2xl flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              <div className="flex items-center gap-2">
                <Image src="/img/medicacao.png" alt="med" width={28} height={28} />
                <span className="text-blue-600 font-semibold">{med.nomeMedicamento}</span>
              </div>
              <ChevronDown
                className={`text-blue-600 w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : "-rotate-90"
                }`}
              />
            </div>

            {isExpanded && (
              <div className="mt-3 flex flex-col gap-2 text-sm">
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <Pill size={18} className="text-cyan-600" />
                <span className="font-semibold">Dosagem:</span> {med.dosagem} {med.unidadeDosagem}
              </div>
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <Syringe size={18} className="text-cyan-600" />
                <span className="font-semibold">Via:</span> {med.viaAdministracao}
              </div>
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <BarChart2 size={18} className="text-cyan-600" />
                <span className="font-semibold">Frequência:</span> {med.frequenciaUso}
              </div>
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <Timer size={18} className="text-cyan-600" />
                <span className="font-semibold">Duração:</span> {med.duracaoTratamento} {med.unidadeDuracao}
              </div>
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <CalendarDays size={18} className="text-cyan-600" />
                <span className="font-semibold">Data inicial:</span>{" "}
                {med.dataInicioTratamento ? new Date(med.dataInicioTratamento).toLocaleDateString() : "Não informado"}
              </div>
              <div style={{ backgroundColor: "#EDFBFF" }} className="rounded-full px-4 py-2 flex items-center gap-2 w-full">
                <Clock size={18} className="text-cyan-600" />
                <span className="font-semibold">Horário:</span> {med.horarioInicio}
              </div>
            </div>
            
            )}
          </div>
        );
      })}
    </div>

    </div>
  );
}