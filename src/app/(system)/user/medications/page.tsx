"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { useState } from "react";
import Image from "next/image";
import GenerateRelatorioButton from "~/components/ui/GenerateRelatorioButton";


export default function MedicationsListPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const clerkId = user?.id ?? "";

  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: userData } = api.user.getUserByClerkId.useQuery({ clerkId }, { enabled: !!clerkId });
  const { data: prescriptions = [], isLoading } = api.prescription.getAllPrescriptions.useQuery(
    { clerkId },
    { enabled: isLoaded && !!clerkId }
  );
  const { data: doctors = [] } = api.prescription.getAllDoctors.useQuery();
  const { data: specialties = [] } = api.prescription.getAllSpecialties.useQuery();

  const filteredPrescriptions = prescriptions.filter(p => {
    const matchDate = selectedDate
      ? new Date(p.dataPrescricao ?? '').toLocaleDateString('en-CA') === selectedDate
      : true;

    const matchDoctor = selectedDoctor ? p.doctorName === selectedDoctor : true;
    const matchSpecialty = selectedSpecialty ? p.especialidade === selectedSpecialty : true;
    const matchSearch = searchTerm
      ? p.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchDate && matchDoctor && matchSpecialty && matchSearch;
  });

  if (!isLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-gray-500 animate-pulse">Carregando prescrições...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="text-black font-semibold">←</button>
          <span className="font-semibold">Minhas Receitas Médicas</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 text-sm p-2 px-4 rounded-full pl-10 focus:outline-none"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-[#F9D078] rounded-[20px] p-2"
        >
          <Image src="/img/filter.png" alt="Filtro" width={24} height={24} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <button onClick={() => setShowFilters(false)} className="text-red-500 text-sm">Cancelar</button>
            <h2 className="font-semibold">Filtros</h2>
            <button className="text-sm text-gray-500" onClick={() => {
              setSelectedDate("");
              setSelectedDoctor("");
              setSelectedSpecialty("");
            }}>Resetar</button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Médico</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-2 rounded-xl border border-gray-300"
            >
              <option value="">Selecione o médico</option>
              {doctors.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Especialidade médica</label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((esp) => (
                <button
                  key={esp ?? ""}
                  onClick={() => setSelectedSpecialty(esp ?? "")}
                  className={`border px-3 py-1 rounded-full text-sm ${selectedSpecialty === esp ? 'bg-blue-100 border-blue-500' : 'text-gray-700'}`}
                >
                  {esp}
                </button>
              ))}
            </div>
          </div>

          <button
            className="mt-4 w-full bg-black text-white py-2 rounded-xl font-semibold"
            onClick={() => setShowFilters(false)}
          >
            Aplicar filtro
          </button>
        </div>
      )}

      {filteredPrescriptions.map((prescription) => (
        <Link
          key={prescription.id}
          href={`/user/medications/${prescription.id}`}
          className="relative block bg-[#62D1F3] rounded-3xl px-6 py-5 overflow-hidden"
        >
          <div className="text-white">
            <p className="text-lg font-bold">Dr. {prescription.doctorName}</p>
            <p className="text-base font-medium">
              {new Date(prescription.dataPrescricao ?? "").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>

          <Image
            src="/img/minhareceita.png"
            alt="Ilustração"
            width={120}
            height={80}
            className="absolute bottom-0 right-0 opacity-80"
          />

          <div className="absolute top-4 right-4">
          <GenerateRelatorioButton
              prescription={{
                ...prescription,
                dataPrescricao: prescription.dataPrescricao ?? new Date(),
              }}
              userData={userData!}
            />
          </div>
        </Link>
      ))}


      {userData?.alergias && userData.alergias.length > 0 && (
        <div className="bg-yellow-100 text-yellow-900 text-sm font-medium px-4 py-2 rounded-xl w-full text-center">
          ⚠️ Alérgico a {userData.alergias.join(", ")}
        </div>
      )}
    </div>
  );
}
