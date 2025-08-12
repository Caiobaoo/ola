"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, X } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function EditUserPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const clerkId = user?.id ?? "";

  const { data: userData, isLoading } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    { enabled: isLoaded && !!clerkId }
  );

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => router.push("/user/perfil"),
  });

  const updateInitial = api.user.updateInitialUserInfo.useMutation({
    onSuccess: () => router.push("/user/perfil"),
  });

  const [formData, setFormData] = useState({
    apelido: "",
    nomecompleto: "",
    datanascimento: "",
    telefone: "",
    genero: "",
    peso: 0,
    altura: 0,
    tipoSanguineo: "",
    doencas: [] as string[],
    alergias: [] as string[],
    cep: "",
    logradouro: "",
    bairro: "",
    numero: "",
    cidade: "",
    uf: "",
  });

  const [newDoenca, setNewDoenca] = useState("");
  const [newAlergia, setNewAlergia] = useState("");

  useEffect(() => {
    if (userData) {
      setFormData({
        apelido: userData.apelido ?? "",
        nomecompleto: userData.nomecompleto ?? "",
        datanascimento: (
          userData.datanascimento
            ? new Date(userData.datanascimento).toISOString().split("T")[0]
            : ""
        ) as string,
        telefone: userData.telefone ?? "",
        genero: userData.genero ?? "",
        peso: userData.peso ?? 0,
        altura: userData.altura ?? 0,
        tipoSanguineo: userData.tipoSanguineo ?? "",
        doencas: userData.doencas ?? [],
        alergias: userData.alergias ?? [],
        cep: userData.cep ?? "",
        logradouro: userData.logradouro ?? "",
        bairro: userData.bairro ?? "",
        numero: userData.numero ?? "",
        cidade: userData.cidade ?? "",
        uf: userData.uf ?? "",
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagRemove = (field: "doencas" | "alergias", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleTagAdd = (field: "doencas" | "alergias", value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleSave = () => {
    const date = new Date(formData.datanascimento);
    if (isNaN(date.getTime())) {
      alert("Data de nascimento inválida.");
      return;
    }

    updateInitial.mutate({
      clerkId,
      apelido: formData.apelido,
      nomecompleto: formData.nomecompleto,
      datanascimento: formData.datanascimento,
    });

    updateUser.mutate({
      clerkId,
      telefone: formData.telefone,
      genero: formData.genero,
      peso: Number(formData.peso),
      altura: Number(formData.altura),
      tipoSanguineo: formData.tipoSanguineo,
      doencas: formData.doencas,
      alergias: formData.alergias,
      cep: formData.cep,
      logradouro: formData.logradouro,
      bairro: formData.bairro,
      numero: formData.numero,
      cidade: formData.cidade,
      uf: formData.uf,
      ativo: true,
    });
  };

  if (!isLoaded || isLoading || !userData) {
    return <div className="text-center py-20 text-gray-500">Carregando dados do usuário...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
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
          <InputField label="Apelido" name="apelido" value={formData.apelido} onChange={handleChange} />
          <InputField label="Nome completo" name="nomecompleto" value={formData.nomecompleto} onChange={handleChange} />
          <InputField label="Data de nascimento" name="datanascimento" type="date" value={formData.datanascimento} onChange={handleChange} />
          <InputField label="Telefone / WhatsApp" name="telefone" value={formData.telefone} onChange={handleChange} />
          <InputField label="Sexo" name="genero" value={formData.genero} onChange={handleChange} />

          <div className="flex gap-4">
            <InputField label="Altura (cm)" name="altura" value={formData.altura.toString()} onChange={handleChange} className="w-1/2" />
            <InputField label="Peso estimado" name="peso" value={formData.peso.toString()} onChange={handleChange} className="w-1/2" />
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-800 block mb-1">Tipo sanguíneo</label>
            <select
              name="tipoSanguineo"
              value={formData.tipoSanguineo}
              onChange={(e) => setFormData({ ...formData, tipoSanguineo: e.target.value })}
              className="w-full bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-0 text-sm"
            >
              <option value="">Selecione</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <TagInput
            label="Doenças pré-existentes"
            tags={formData.doencas}
            newTag={newDoenca}
            setNewTag={setNewDoenca}
            onAdd={(val) => handleTagAdd("doencas", val)}
            onRemove={(index) => handleTagRemove("doencas", index)}
          />

          <TagInput
            label="Alergias"
            tags={formData.alergias}
            newTag={newAlergia}
            setNewTag={setNewAlergia}
            onAdd={(val) => handleTagAdd("alergias", val)}
            onRemove={(index) => handleTagRemove("alergias", index)}
          />

          <InputField label="CEP" name="cep" value={formData.cep} onChange={handleChange} />
          <InputField label="Logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} />

          <div className="flex gap-4">
            <InputField label="Bairro" name="bairro" value={formData.bairro} onChange={handleChange} className="w-1/2" />
            <InputField label="Número" name="numero" value={formData.numero} onChange={handleChange} className="w-1/2" />
          </div>

          <div className="flex gap-4">
            <InputField label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} className="w-1/2" />
            <InputField label="UF" name="uf" value={formData.uf} onChange={handleChange} className="w-1/2" />
          </div>

          <Button onClick={handleSave} className="w-full bg-black text-white rounded-full mt-6">
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <div className={`mb-2 ${className}`}>
      <label className="text-sm font-semibold text-gray-800 block mb-1">{label}</label>
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-gray-100 rounded-full border-none px-4 py-2 text-sm"
      />
    </div>
  );
}

function TagInput({
  label,
  tags,
  newTag,
  setNewTag,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  newTag: string;
  setNewTag: (val: string) => void;
  onAdd: (val: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-800 block mb-1">{label}</label>
      <div className="bg-gray-100 rounded-full px-4 py-2 flex flex-wrap gap-2">
        {tags.map((item, index) => (
          <span key={index} className="bg-cyan-200 text-cyan-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            {item}
            <X className="w-3 h-3 cursor-pointer" onClick={() => onRemove(index)} />
          </span>
        ))}
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(newTag);
              setNewTag("");
            }
          }}
          placeholder="Digite e pressione Enter"
          className="bg-transparent text-sm focus:outline-none flex-1 min-w-[100px]"
        />
      </div>
    </div>
  );
}
