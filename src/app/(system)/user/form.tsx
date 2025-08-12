"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Plus, Trash } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

type UserFormData = {
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  datanascimento: string;
  cpf: string;
  genero: string;
  peso: string;
  altura: string;
  tipoSanguineo: string;
  doencas: string[];
  alergias: string[];
  cep: string;
  logradouro: string;
  bairro: string;
  numero: string;
  cidade: string;
  uf: string;
};

export default function CompleteProfilePage() {
  const { user } = useUser();
  const clerkId = user?.id ?? "";
  const router = useRouter();

  const { data: userData, isLoading } = api.user.getUserByClerkId.useQuery(
    { clerkId },
    { enabled: !!clerkId }
  );

  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [weight, setWeight] = useState<number>(42);
  const [height, setHeight] = useState<number>(155);
  const [currentDisease, setCurrentDisease] = useState("");
  const [currentAllergy, setCurrentAllergy] = useState("");

  const [formData, setFormData] = useState<UserFormData>({
    nome: user?.firstName || "",
    sobrenome: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
    telefone: "",
    datanascimento: "",
    cpf: "",
    genero: "",
    peso: "",
    altura: "",
    tipoSanguineo: "",
    doencas: [],
    alergias: [],
    cep: "",
    logradouro: "",
    bairro: "",
    numero: "",
    cidade: "",
    uf: "",
  });

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        telefone: userData.telefone ?? "",
        datanascimento: (
          userData.datanascimento
            ? new Date(userData.datanascimento).toISOString().split("T")[0]
            : ""
        ) as string,
        genero: userData.genero ?? "",
        peso: userData.peso?.toString() ?? "",
        altura: userData.altura?.toString() ?? "",
        tipoSanguineo: userData.tipoSanguineo ?? "",
        doencas: userData.doencas ?? [],
        alergias: userData.alergias ?? [],
        cep: userData.cep ?? "",
        logradouro: userData.logradouro ?? "",
        bairro: userData.bairro ?? "",
        numero: userData.numero ?? "",
        cidade: userData.cidade ?? "",
        uf: userData.uf ?? "",
      }));

      setWeight(userData.peso ?? 42);
      setHeight(userData.altura ?? 155);
    }
  }, [userData]);

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: () => setShowSuccess(true),
  });

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!clerkId) return;
    updateUser.mutate({
      clerkId,
      telefone: formData.telefone,
      genero: formData.genero,
      peso: weight,
      altura: height,
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value).toFixed(1);
    setWeight(parseFloat(value));
  };

  const handleAddItem = (type: "doencas" | "alergias", value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], value.trim()],
      }));
      type === "doencas" ? setCurrentDisease("") : setCurrentAllergy("");
    }
  };

  const handleRemoveItem = (type: "doencas" | "alergias", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  if (step === 0) {
    return (
      <div className="min-h-screen bg-white px-4 py-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setStep(0)} />
            <h2 className="text-md font-semibold select-none">Complete seu perfil</h2>
          </div>
          <Image src="/img/user0.png" width={240} height={160} alt="Boas-vindas" className="mx-auto mb-6" />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Seu perfil está quase lá...</p>
            <p className="text-gray-600 mb-6">
              Queremos te conhecer melhor! Complete seu perfil e aproveite tudo o que o app tem para lhe oferecer.
            </p>
          </div>
          <Button className="w-full bg-black text-white rounded-md py-3 text-lg" onClick={() => setStep(1)}>
            Completar perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        {!showSuccess ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setStep(step > 1 ? step - 1 : 0)} />
              <h2 className="text-md font-semibold select-none">Complete seu perfil</h2>
            </div>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex-1 h-2 rounded-full bg-gray-300 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%`, backgroundColor: "#3CDBFF" }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-800">{step} de 5</span>
            </div>

            {step === 1 && (
              <div className="w-full px-4 py-6 flex flex-col items-center">
                <div className="w-full max-w-md">
                  <div className="text-left mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Sua identidade importa!</h2>
                    <p className="text-sm text-gray-600">
                      Nos diga como você se identifica para que sua experiência no app seja ainda mais autêntica e personalizada!
                    </p>
                  </div>

                  <Image
                    src="/img/user1.png"
                    alt="Gênero"
                    width={300}
                    height={260}
                    className="mx-auto mb-2"
                  />

                  <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-full max-w-md -mt-6 flex flex-col justify-between">
                    <div>
                    <h3 className="text-base font-semibold mb-4 text-center">Eu sou:</h3>
                      <div className="flex justify-center gap-4 mb-4">
                      {[
                        { label: "Homem", value: "masculino", image: "/img/masculino.png", highlight: { border: "border-[#19ABCC]", bg: "bg-[#3BD8FC]" } },
                        { label: "Mulher", value: "feminino", image: "/img/feminino.png", highlight: { border: "border-[#FF73CC]", bg: "bg-[#FFD6F9]" } },
                        { label: "Outro", value: "outro", image: "/img/outro.png", highlight: { border: "border-[#B5B5B5]", bg: "bg-[#E0E0E0]" } },
                      ].map((option) => {
                        const isSelected = formData.genero === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleChange("genero", option.value)}
                            className={`flex-1 min-w-[100px] h-[130px] flex flex-col items-center justify-center border-2 rounded-2xl transition-all duration-300 ${
                              isSelected
                                ? `${option.highlight.border} ${option.highlight.bg} text-white font-bold`
                                : "border-gray-200 text-gray-500"
                            }`}
                          >
                            <Image
                              src={option.image}
                              alt={option.label}
                              width={70}
                              height={70}
                              className="mb-2 rounded-full shadow-sm"
                            />
                            <span className={`text-sm ${isSelected ? "font-bold" : ""}`}>{option.label}</span>
                          </button>
                        );
                      })}
                      </div>
                    </div>

                    <Button className="w-full bg-black text-white rounded-md py-3" onClick={() => setStep(2)}>
                      Avançar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
                      <>
                        <div className="w-full px-4 py-6 flex flex-col items-center">
                          <div className="w-full max-w-md">
                            <div className="text-left mb-4">
                              <h2 className="text-lg font-bold text-gray-900 mb-2">Queremos cuidar de você!</h2>
                              <p className="text-sm text-gray-600">
                                Informe seu peso para uma experiência mais personalizada e adaptada às suas necessidades!
                              </p>
                            </div>

                            <Image
                              src="/img/user2.png" 
                              alt="Peso"
                              width={180}
                              height={180}
                              className="mx-auto mb-4"
                            />

                            <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-full max-w-md mt-0">
                              <h3 className="text-base font-semibold mb-4 text-center">Digite o seu peso</h3>

                              <div className="flex justify-center items-center gap-2 mb-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="500"
                                  step="0.1"
                                  value={weight}
                                  onChange={handleSliderChange}
                                  className="w-full h-2 bg-blue-200 rounded-lg"
                                />
                                <span className="font-semibold">{weight} KG</span>
                              </div>
                              <Button
                                className="w-full bg-black text-white rounded-md py-3 mt-4"
                                onClick={() => setStep(3)} 
                              >
                              Avançar
                            </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <div className="w-full px-4 py-6 flex flex-col items-center">
                        <div className="w-full max-w-md">
                          <div className="text-left mb-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Queremos cuidar de você!</h2>
                            <p className="text-sm text-gray-600">
                              Informe sua altura para uma experiência mais personalizada e adaptada às suas necessidades!
                            </p>
                          </div>

                          <Image
                            src="/img/user3.png"
                            alt="Altura"
                            width={100}
                            height={150}
                            className="mx-auto mb-4"
                          />

                          <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-full max-w-md mt-0">
                            <h3 className="text-base font-semibold mb-4 text-center">Digite sua altura</h3>

                            <div className="flex justify-center items-center gap-2 mb-4">
                              <input
                                type="range"
                                min="120"
                                max="200"
                                value={height}
                                onChange={(e) => setHeight(Number(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg"
                              />
                              <span className="font-semibold">{height} cm</span>
                            </div>
                            <Button className="w-full bg-black text-white rounded-md py-3 mt-4" onClick={() => setStep(4)}>
                              Avançar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}


                    {step === 4 && (
                      <div className="w-full px-4 py-6 flex flex-col items-center">
                        <div className="w-full max-w-md">
                          <div className="text-left mb-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Sua saúde em primeiro lugar!</h2>
                            <p className="text-sm text-gray-600">
                              Nos conte se você tem alguma alergia ou doença pré-existente para ajudarmos a tornar sua experiência mais segura.
                            </p>
                          </div>

                          <Image
                            src="/img/user4.png"
                            alt="Saúde"
                            width={260}
                            height={300}
                            className="mx-auto mb-4"
                          />

                          <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-full max-w-md mb-4">
                            <div className="mb-4">
                              <label className="font-semibold">Tipo sanguíneo</label>
                              <select
                                value={formData.tipoSanguineo}
                                onChange={(e) => setFormData({ ...formData, tipoSanguineo: e.target.value })}
                                className="w-full mt-2 px-3 py-2 border rounded-md"
                              >
                                <option value="">Selecione o tipo sanguíneo</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                              </select>
                            </div>

                            <div className="mb-4">
                              <label className="font-semibold">Doenças pré-existentes</label>
                              <div className="flex flex-wrap gap-2 mt-2 px-2 py-2 border rounded-md min-h-[45px]">
                                {formData.doencas.map((doenca, index) => (
                                  <span
                                    key={index}
                                    className="bg-[#9FEDFF] text-green-800 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                                  >
                                    {doenca}
                                    <button type="button" onClick={() => handleRemoveItem("doencas", index)}>
                                      <span className="ml-1 font-bold">x</span>
                                    </button>
                                  </span>
                                ))}
                                <input
                                  type="text"
                                  value={currentDisease}
                                  onChange={(e) => setCurrentDisease(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && currentDisease.trim()) {
                                      handleAddItem("doencas", currentDisease);
                                    }
                                  }}
                                  placeholder="Digite a doença"
                                  className="flex-1 outline-none min-w-[80px] text-sm"
                                />
                              </div>
                            </div>

                            <div className="mb-4">
                              <label className="font-semibold">Alergias</label>
                              <div className="flex flex-wrap gap-2 mt-2 px-2 py-2 border rounded-md min-h-[45px]">
                                {formData.alergias.map((alergia, index) => (
                                  <span
                                    key={index}
                                    className="bg-[#9FEDFF] text-green-800 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                                  >
                                    {alergia}
                                    <button type="button" onClick={() => handleRemoveItem("alergias", index)}>
                                      <span className="ml-1 font-bold">x</span>
                                    </button>
                                  </span>
                                ))}
                                <input
                                  type="text"
                                  value={currentAllergy}
                                  onChange={(e) => setCurrentAllergy(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && currentAllergy.trim()) {
                                      handleAddItem("alergias", currentAllergy);
                                    }
                                  }}
                                  placeholder="Digite a alergia"
                                  className="flex-1 outline-none min-w-[80px] text-sm"
                                />
                              </div>
                            </div>

                            {/* Botão Avançar */}
                            <Button
                              className="w-full bg-black text-white rounded-md py-3 mt-4"
                              onClick={() => setStep(5)}
                            >
                              Avançar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="w-full px-4 py-6 flex flex-col items-center">
                        <div className="w-full max-w-md">
                          <div className="text-left mb-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Queremos saber onde te encontrar!</h2>
                            <p className="text-sm text-gray-600">
                              Informe seu endereço para facilitar o uso e aproveitar todos os recursos do app!
                            </p>
                          </div>

                          <Image
                            src="/img/user5.png"
                            alt="Localização"
                            width={300}
                            height={260}
                            className="mx-auto mb-4"
                          />

                          <div className="bg-white rounded-3xl p-5 shadow-md border border-gray-200 text-sm w-full max-w-md mb-4 space-y-3">
                            <div className="flex gap-3">
                              <div className="relative w-[40%]">
                                <input
                                  type="text"
                                  placeholder="Informe o seu CEP"
                                  value={formData.cep}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    const masked = raw.replace(/^(\d{5})(\d{0,3})/, "$1-$2").slice(0, 9);
                                    handleChange("cep", masked);
                                  }}
                                  className="w-full pl-4 pr-10 py-2 rounded-full border bg-gray-50"
                                />
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>

                              <div className="relative w-[60%]">
                                <input
                                  type="text"
                                  placeholder="Informe seu endereço"
                                  value={formData.logradouro}
                                  onChange={(e) => handleChange("logradouro", e.target.value)}
                                  className="w-full pl-4 pr-10 py-2 rounded-full border bg-gray-50"
                                />
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="relative w-[70%]">
                                <input
                                  type="text"
                                  placeholder="Informe seu bairro"
                                  value={formData.bairro}
                                  onChange={(e) => handleChange("bairro", e.target.value)}
                                  className="w-full pl-4 pr-10 py-2 rounded-full border bg-gray-50"
                                />
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>

                              <div className="relative w-[30%]">
                                <input
                                  type="text"
                                  placeholder="Número"
                                  value={formData.numero}
                                  onChange={(e) => handleChange("numero", e.target.value)}
                                  className="w-full px-4 py-2 rounded-full border bg-gray-50"
                                />
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <div className="relative w-[70%]">
                                <input
                                  type="text"
                                  placeholder="Informe sua cidade"
                                  value={formData.cidade}
                                  onChange={(e) => handleChange("cidade", e.target.value)}
                                  className="w-full pl-4 pr-10 py-2 rounded-full border bg-gray-50"
                                />
                                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                              </div>

                              <div className="relative w-[30%]">
                                <select
                                  value={formData.uf}
                                  onChange={(e) => handleChange("uf", e.target.value)}
                                  className="w-full px-4 py-2 rounded-full border bg-gray-50 text-gray-500"
                                >
                                  <option value="">UF</option>
                                  {[
                                    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
                                    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
                                    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
                                  ].map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Whatsapp"
                                value={formData.telefone}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/\D/g, "");
                                  const masked = raw
                                    .replace(/^(\d{0,2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) =>
                                      p3 ? `(${p1}) ${p2}-${p3}` : p2 ? `(${p1}) ${p2}` : `(${p1}`
                                    )
                                    .slice(0, 15);
                                  handleChange("telefone", masked);
                                }}
                                className="w-full pl-4 pr-10 py-2 rounded-full border bg-gray-50"
                              />
                              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            </div>

                            <Button className="w-full bg-black text-white rounded-md py-3 mt-2" onClick={handleSubmit}>
                              Avançar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center px-4 py-6 bg-white">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => router.push("/")} />
              <h2 className="text-md font-semibold select-none">Complete seu perfil</h2>
            </div>

            <div className="text-center space-y-6">
              <Image
                src="/img/user6.png"
                width={220}
                height={180}
                alt="Perfil concluído"
                className="mx-auto"
              />
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">Perfil concluído! 🎉</h2>
                <p className="text-gray-600 text-sm">
                  Agora é só explorar e aproveitar todas as funcionalidades do app!
                </p>
              </div>

              <Button
                className="w-full bg-black text-white rounded-md py-3"
                onClick={() => router.push("/")}
              >
                Concluir
              </Button>
            </div>
          </div>
        </div>

        )}
      </div>
    </div>
  );
}
