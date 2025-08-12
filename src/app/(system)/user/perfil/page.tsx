"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

export default function UserProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const clerkId = user?.id ?? "";

  const { data: userData, isLoading } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    {
      enabled: isLoaded && !!clerkId,
    }
  );

  if (!isLoaded || isLoading || !userData) {
    return <div className="text-center py-20 text-gray-500">Carregando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-16"> {/* Espaço inferior para o menu */}
      <div className="w-full max-w-md">
        <div className="relative bg-cyan-200 h-36 rounded-b-3xl">
          <div className="absolute top-4 left-4 flex items-center gap-2 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="text-white" size={20} />
            <span className="text-white font-semibold text-sm">Perfil</span>
          </div>

          <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md text-xs text-black">
            Avatar
          </div>
        </div>

        <div className="mt-16 px-6 pb-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{userData.apelido}</h2>
            <Button
              className="text-xs text-white bg-black px-4 py-1 rounded-full mt-1"
              onClick={() => router.push(`/user/perfil/${userData.id}/edit`)}
            >
              Editar perfil
            </Button>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-sm font-semibold text-gray-800 block mb-1">Apelido</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">{userData.apelido}</div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">Nome completo</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">{userData.nomecompleto}</div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">Data de nascimento</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">
              {new Date(userData.datanascimento ?? "").toLocaleDateString("pt-BR")}
            </div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">Sexo</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">{userData.genero}</div>

            <div className="flex justify-between gap-4">
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">Altura</p>
                <div className="bg-gray-100 rounded-full px-4 py-2 text-center">{userData.altura} cm</div>
              </div>
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">Peso estimado</p>
                <div className="bg-gray-100 rounded-full px-4 py-2 text-center">{userData.peso} kg</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 block mb-1">Tipo sanguíneo</label>
              <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center w-full">
                {userData?.tipoSanguineo ? (
                  <span className="bg-red-200 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {userData.tipoSanguineo}
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">Não informado</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 block mb-1">Doenças pré-existentes</label>
              <div className="bg-gray-100 rounded-full px-4 py-2 flex flex-wrap gap-2 w-full">
                {userData?.doencas && userData.doencas.length > 0 ? (
                  userData.doencas.map((doenca, index) => (
                    <span
                      key={index}
                      className="bg-cyan-200 text-cyan-900 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {doenca}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Não informado</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-800 block mb-1">Alergias</label>
              <div className="bg-gray-100 rounded-full px-4 py-2 flex flex-wrap gap-2 w-full">
                {userData?.alergias && userData.alergias.length > 0 ? (
                  userData.alergias.map((alergia, index) => (
                    <span
                      key={index}
                      className="bg-cyan-200 text-cyan-900 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {alergia}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Não informado</span>
                )}
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">CEP</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">{userData.cep}</div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">Logradouro</p>
            <div className="bg-gray-100 rounded-full px-4 py-2">{userData.logradouro}</div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">Bairro</p>
                <div className="bg-gray-100 rounded-full px-4 py-2">{userData.bairro}</div>
              </div>
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">Número</p>
                <div className="bg-gray-100 rounded-full px-4 py-2">{userData.numero}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">Cidade</p>
                <div className="bg-gray-100 rounded-full px-4 py-2">{userData.cidade}</div>
              </div>
              <div className="w-1/2">
                <p className="text-sm font-semibold text-gray-800 block mb-1">UF</p>
                <div className="bg-gray-100 rounded-full px-4 py-2">{userData.uf}</div>
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-800 block mb-1">Whatsapp</p>
            <div className="relative bg-gray-100 rounded-full px-4 py-2 flex items-center">
              <Phone size={16} className="mr-2 text-gray-500" />
              <span>{userData.telefone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
