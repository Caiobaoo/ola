"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type MedicationFormData = {
  nomeMedicamento: string;
  dosagem: string;
  unidadeDosagem: string;
  unidadeDuracao: string;
  viaAdministracao: string;
  frequenciaUso: string;
  duracaoTratamento: string;
  dataInicioTratamento: string;
  horarioInicio: string;
};

export default function RegisterMedForm() {
  const { user } = useUser();
  const clerkId = user?.id;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);

  const [medications, setMedications] = useState<MedicationFormData[]>([{
    nomeMedicamento: "",
    dosagem: "",
    unidadeDosagem: "",
    viaAdministracao: "",
    frequenciaUso: "",
    duracaoTratamento: "",
    unidadeDuracao: "",
    dataInicioTratamento: "",
    horarioInicio: "",
  }]);

  const [formData, setFormData] = useState({
    dataPrescricao: "",
    doctorName: "",
    doctorCRM: "",
    especialidade: "",
    observacao: "",
  });

  const createFullPrescription = api.prescription.create.useMutation({
    onSuccess: (data) => {
      setPrescriptionId(data.prescription.id); 
      setShowSuccess(true);
    },
  });
  
  const addMedication = api.prescription.addMedication.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
    },
  });
  
  

  const handleMedicationChange = (
    index: number,
    field: keyof MedicationFormData,
    value: string
  ) => {
    setMedications((prev) => {
      const updated = [...prev];
      const current = updated[index] ?? {
        nomeMedicamento: "",
        dosagem: "",
        unidadeDosagem: "",
        viaAdministracao: "",
        frequenciaUso: "",
        duracaoTratamento: "",
        unidadeDuracao: "",
        dataInicioTratamento: "",
        horarioInicio: "",
      };
      updated[index] = { ...current, [field]: value };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        {!showSuccess && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft
                className="w-4 h-4 cursor-pointer"
                onClick={() => (step > 1 ? setStep(step - 1) : router.push("/"))}
              />
              <h2 className="text-md font-semibold select-none">
                Adicionar Receita manualmente
              </h2>
            </div>

            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex-1 h-2 rounded-full bg-gray-300 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(step / 3) * 100}%`,
                    backgroundColor: "#3CDBFF",
                  }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-800">{step} de 3</span>
            </div>

            <Image
              src={
                step === 1
                  ? "/img/med3.png"
                  : step === 2
                  ? "/img/med1.png"
                  : step === 3
                  ? "/img/med2.png"
                  : "/img/med4.png"
              }
              width={240}
              height={160}
              alt="ilustração"
              className="mx-auto mb-4"
            />

            <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-[400px] mx-auto flex flex-col space-y-4">
            <div className="space-y-3">
                {step === 1 && (
                  <>
                   <div className="bg-cyan-50 rounded-xl p-4 mb-4">
                    <label className="text-cyan-600 font-semibold block mb-1">Nome do médico</label>
                    <Input
                      className="bg-white rounded-full border-none px-4 py-2 text-cyan-600 placeholder-cyan-300 text-sm"
                      placeholder="Informe o nome do seu médico"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    />
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-4">
                    <label className="text-cyan-600 font-semibold block mb-1">CRM do médico</label>
                    <Input
                      className="bg-white rounded-full border-none px-4 py-2 text-cyan-600 placeholder-cyan-300 text-sm"
                      placeholder="Informe o CRM do seu médico"
                      value={formData.doctorCRM}
                      onChange={(e) => setFormData({ ...formData, doctorCRM: e.target.value })}
                    />
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-4">
                    <label className="text-cyan-600 font-semibold block mb-1">Especialidade do médico</label>
                    <Input
                      className="bg-white rounded-full border-none px-4 py-2 text-cyan-600 placeholder-cyan-300 text-sm"
                      placeholder="Informe a especialidade do médico"
                      value={formData.especialidade}
                      onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    />
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-4">
                    <label className="text-cyan-600 font-semibold block mb-1">Observação</label>
                    <Input
                      className="bg-white rounded-full border-none px-4 py-2 text-cyan-600 placeholder-cyan-300 text-sm"
                      placeholder="Observações adicionais sobre a receita"
                      value={formData.observacao || ""}
                      onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    />
                  </div>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-4">
                    <label className="text-cyan-600 font-semibold block mb-1">Data da prescrição</label>
                    <Input
                      type="date"
                      className="bg-white text-cyan-600 rounded-full border-none px-4 py-2 placeholder-cyan-300 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      placeholder="dd/mm/aaaa"
                      value={formData.dataPrescricao}
                      onChange={(e) => setFormData({ ...formData, dataPrescricao: e.target.value })}
                    />
                  </div>

                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-0.5">
                        Nome da medicação e dosagem
                      </label>
                      <Input
                        className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Informe a medicação, ex: amoxilina 244mg"
                        value={medications.at(-1)?.nomeMedicamento ?? ""}
                        onChange={(e) =>
                          handleMedicationChange(medications.length - 1, "nomeMedicamento", e.target.value)
                        }
                      />
                    </div>

                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-1">Dosagem prescrita</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(medications.at(-1)?.dosagem || "0", 10);
                            handleMedicationChange(medications.length - 1, "dosagem", String(Math.max(0, current - 1)));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-cyan-300 text-white text-sm font-bold"
                        >
                          −
                        </button>

                        <div className="px-4 py-1 bg-white rounded-full text-sm text-center w-14 text-cyan-600">
                          {medications.at(-1)?.dosagem || "0"}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(medications.at(-1)?.dosagem || "0", 10);
                            handleMedicationChange(medications.length - 1, "dosagem", String(current + 1));
                          }}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-cyan-300 text-white text-sm font-bold"
                        >
                          +
                        </button>

                        <Input
                          className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm flex-1 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="comprimido"
                          value={medications.at(-1)?.unidadeDosagem || ""}
                          onChange={(e) =>
                            handleMedicationChange(medications.length - 1, "unidadeDosagem", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-0.5">Via de administração</label>
                      <Input
                        className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Ex: oral, subcutânea, etc..."
                        value={medications.at(-1)?.viaAdministracao ?? ""}
                        onChange={(e) =>
                          handleMedicationChange(medications.length - 1, "viaAdministracao", e.target.value)
                        }
                      />
                    </div>

                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-0.5">Frequência de uso do medicamento</label>
                      <Input
                        className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Informe o intervalo entre as doses do medicamento"
                        value={medications.at(-1)?.frequenciaUso ?? ""}
                        onChange={(e) =>
                          handleMedicationChange(medications.length - 1, "frequenciaUso", e.target.value)
                        }
                      />
                    </div>

                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block">
                        Duração do tratamento
                      </label>
                      <p className="text-xs text-cyan-400 mb-2">Por quanto tempo você terá que tomar a medicação?</p>
                      <div className="flex items-center bg-white rounded-full px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          className="bg-transparent flex-1 outline-none border-none text-cyan-600 text-sm placeholder-cyan-300"
                          placeholder="0"
                          value={medications.at(-1)?.duracaoTratamento || ""}
                          onChange={(e) =>
                            handleMedicationChange(medications.length - 1, "duracaoTratamento", e.target.value)
                          }
                        />
                        <select
                          className="bg-transparent text-cyan-600 text-sm outline-none border-none ml-2"
                          value={medications.at(-1)?.unidadeDuracao || "dias"}
                          onChange={(e) =>
                            handleMedicationChange(medications.length - 1, "unidadeDuracao", e.target.value)
                          }
                        >
                          <option value="dias">dias</option>
                          <option value="semanas">semanas</option>
                          <option value="meses">meses</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-1">Data inicial</label>
                      <p className="text-xs text-cyan-400 mb-2">Qual a data que você deseja começar a tomar a medicação?</p>
                      <Input
                        type="date"
                        className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={medications.at(-1)?.dataInicioTratamento ?? ""}
                        onChange={(e) =>
                          handleMedicationChange(medications.length - 1, "dataInicioTratamento", e.target.value)
                        }
                      />
                    </div>

                    <div className="bg-cyan-50 rounded-xl px-4 py-3">
                      <label className="text-cyan-600 font-semibold text-sm block mb-1">Horário inicial</label>
                      <p className="text-xs text-cyan-400 mb-2">De que horas você deseja começar a tomar a medicação?</p>
                      <Input
                        type="time"
                        className="bg-white text-cyan-600 placeholder-cyan-300 rounded-full border-none px-4 py-2 text-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={medications.at(-1)?.horarioInicio ?? ""}
                        onChange={(e) =>
                          handleMedicationChange(medications.length - 1, "horarioInicio", e.target.value)
                        }
                      />
                    </div>

                  </>
                )}
              </div>

              <div className="pt-4">
                {step === 3 ? (
                  <Button
                    className="w-full bg-black text-white rounded-md py-2"
                    onClick={() => {
                      if (!clerkId) return;

                      const lastMedication = medications.at(-1);
                      if (!lastMedication) return;

                      if (prescriptionId) {
                        addMedication.mutate({
                          prescriptionId,
                          medication: lastMedication,
                        });
                      } else {
                        createFullPrescription.mutate({
                          clerkId,
                          doctorName: formData.doctorName,
                          doctorCRM: formData.doctorCRM,
                          especialidade: formData.especialidade,
                          dataPrescricao: formData.dataPrescricao || undefined,
                          observacao: "",
                          medications: [lastMedication],
                        });
                      }
                    }}
                  >
                    Salvar Receita
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-black text-white rounded-md py-2"
                    onClick={() => setStep(step + 1)}
                  >
                    Avançar
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {showSuccess && (
          <div className="w-full max-w-md text-center space-y-4">
            <Image
              src="/img/med4.png"
              width={200}
              height={150}
              alt="sucesso"
              className="mx-auto"
            />
            <h2 className="text-lg font-semibold">
              Receita salva com sucesso!
            </h2>

            <Button
              variant="outline"
              className="w-full border-black text-black"
              onClick={() => {
                setMedications(prev => [
                  ...prev,
                  {
                    nomeMedicamento: "",
                    dosagem: "",
                    unidadeDosagem: "",
                    viaAdministracao: "",
                    frequenciaUso: "",
                    duracaoTratamento: "",
                    unidadeDuracao: "",
                    dataInicioTratamento: "",
                    horarioInicio: "",
                  },
                ]);
                setStep(2);               
                setShowSuccess(false);    
              }}
            >
              Adicionar novo medicamento
            </Button>


            <Button
              className="w-full bg-black text-white"
              onClick={() => router.push("/")}
            >
              Voltar para início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
