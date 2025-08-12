"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "~/components/ui/button"; // <-- Certifique-se que esse é o mesmo Button do seu projeto

type Medication = {
  nomeMedicamento: string;
  dosagem: string;
  unidadeDosagem: string;
  viaAdministracao: string;
  frequenciaUso: string;
  duracaoTratamento?: string | null;
  unidadeDuracao?: string | null;
  dataInicioTratamento?: string | Date | null;
  horarioInicio?: string | null;
};

type Prescription = {
  id: string;
  doctorName: string;
  doctorCRM: string;
  especialidade?: string | null;
  dataPrescricao: string | Date;
  medications: Medication[];
  observacao?: string | null;
};

type UserData = {
  nome?: string | null;
  sobrenome?: string | null;
  nomecompleto?: string | null;
  datanascimento?: string | Date | null;
  tipoSanguineo?: string | null;
  doencas?: string[] | null;
  alergias?: string[] | null;
};

type Props = {
  prescription: Prescription;
  userData: UserData;
  className?: string;
};

function calcularIdade(dataNascimento: Date) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

export default function GenerateRelatorioButton({ prescription, userData, className }: Props) {
  const handleGeneratePdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cler App", 10, 10);
    doc.setFontSize(12);
    doc.text("Receituário", 10, 20);
    doc.text(`Data da receita: ${new Date(prescription.dataPrescricao).toLocaleDateString("pt-BR")}`, 10, 30);
    doc.text(`Dr. ${prescription.doctorName}`, 10, 40);
    doc.text(`Especialidade: ${prescription.especialidade ?? "N/A"}`, 10, 50);
    doc.text(`CRM: ${prescription.doctorCRM}`, 10, 60);

    const nomePaciente = userData?.nomecompleto || `${userData?.nome ?? ""} ${userData?.sobrenome ?? ""}`.trim();
    const idade = userData?.datanascimento ? calcularIdade(new Date(userData.datanascimento)) : "N/A";

    doc.text(`Nome do paciente: ${nomePaciente}`, 10, 70);
    doc.text(`Idade: ${idade !== "N/A" ? `${idade} anos` : "N/A"}`, 10, 80);
    doc.text(`Tipo sanguíneo: ${userData?.tipoSanguineo ?? "N/A"}`, 10, 90);
    doc.text(`Doenças: ${(userData?.doencas ?? []).join(", ") || "N/A"}`, 10, 100);
    doc.text(`Alérgico a: ${(userData?.alergias ?? []).join(", ") || "N/A"}`, 10, 110);

    let y = 120;
    prescription.medications.forEach((med, i) => {
      doc.text(`Medicação ${i + 1}: ${med.nomeMedicamento}`, 10, y); y += 10;
      doc.text(`Dosagem: ${med.dosagem} ${med.unidadeDosagem}`, 10, y); y += 10;
      doc.text(`Via de administração: ${med.viaAdministracao}`, 10, y); y += 10;
      doc.text(`Frequência: ${med.frequenciaUso}`, 10, y); y += 10;
      doc.text(`Duração: ${med.duracaoTratamento ?? "N/A"} ${med.unidadeDuracao ?? ""}`, 10, y); y += 10;
      doc.text(`Data início: ${med.dataInicioTratamento ? new Date(med.dataInicioTratamento).toLocaleDateString("pt-BR") : "N/A"}`, 10, y); y += 10;
      doc.text(`Horário: ${med.horarioInicio ?? "N/A"}`, 10, y); y += 10;
    });

    if (prescription.observacao) {
      doc.text(`Observação: ${prescription.observacao}`, 10, y + 10);
    }

    doc.save("receita.pdf");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        handleGeneratePdf();
      }}
    >
      <Download className="w-4 h-4" />
    </Button>
  );
}
