"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Camera } from "lucide-react";

export default function InitialWelcomeForm() {
  const { user } = useUser();
  const clerkId = user?.id ?? "";
  const nome = user?.firstName ?? "";
  const sobrenome = user?.lastName ?? "";
  const router = useRouter();

  const { data: userData } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    { enabled: !!clerkId }
  );

  const [formData, setFormData] = useState({
    apelido: "",
    nomecompleto: `${nome} ${sobrenome}`.trim(),
    datanascimento: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        apelido: userData.apelido || "",
        nomecompleto: userData.nomecompleto || `${nome} ${sobrenome}`.trim(),
        datanascimento: (
          userData.datanascimento
            ? new Date(userData.datanascimento).toISOString().split("T")[0]
            : ""
        ) as string,
      });
    }
  }, [userData, nome, sobrenome]);

  const updateInitial = api.user.updateInitialUserInfo.useMutation({
    onSuccess: () => router.push("/"),
  });

  const handleSubmit = () => {
    updateInitial.mutate({
      clerkId,
      apelido: formData.apelido,
      nomecompleto: formData.nomecompleto,
      datanascimento: formData.datanascimento,
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 flex flex-col justify-center items-center pb-20 relative overflow-hidden">
      <div className="w-full max-w-md relative">

      <div className="z-20 relative mt-8 px-5 text-left mb-16">
      <h1 className="text-lg font-semibold mb-1">Bem vindo ao Cler App</h1>
      <p className="text-sm text-gray-600">
        Aqui, cuidar da sua saúde fica mais fácil. Vamos começar fazendo o seu perfil
      </p>
    </div>

    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
      <Image
        src="/img/init.png"
        alt="Ilustração do app"
        width={240}
        height={160}
      />
    </div>

        <div className="relative flex justify-center mt-24 z-30 h-40">
          <div className="relative w-32 h-32">
            <div className="absolute w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center z-40">
              <Image src="/img/outro.png" alt="Avatar" width={128} height={128} />
            </div>
            <div className="absolute -bottom-2 -right-2 z-50">
              <div className="bg-white rounded-full p-2 shadow-md border border-gray-300 flex items-center justify-center">
                <Camera className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-[50px] p-5 shadow-md border border-gray-200 w-full space-y-4 -mt-16 relative pt-16 z-20">
        <div>
            <label className="font-semibold text-sm">Quero ser chamado de:</label>
            <Input
              placeholder="Informe o nome que você quer ser chamado"
              value={formData.apelido}
              onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
              className="bg-gray-100 rounded-full border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Nome completo</label>
            <Input
              placeholder="Informe o seu nome completo"
              value={formData.nomecompleto}
              onChange={(e) => setFormData({ ...formData, nomecompleto: e.target.value })}
              className="bg-gray-100 rounded-full border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">Data de nascimento</label>
            <Input
              type="date"
              placeholder="dd/mm/aaaa"
              value={formData.datanascimento}
              onChange={(e) => setFormData({ ...formData, datanascimento: e.target.value })}
              className="bg-gray-100 rounded-full border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            className="w-full bg-black text-white rounded-md mt-2"
            onClick={handleSubmit}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
