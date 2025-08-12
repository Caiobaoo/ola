"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";
import { ChevronLeft } from "lucide-react";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { Input } from "~/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react"; // Importando tRPC client

const formSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  sobrenome: z.string().min(2, { message: "O sobrenome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
});

export function SignUpForm() {
  const { isLoaded, setActive, signUp } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pendingEmailCode, setPendingEmailCode] = useState(false);
  const [code, setCode] = useState("");

  // Hook do tRPC para cadastrar/verificar usuário
  const { mutateAsync: checkOrCreateUser } = api.user.checkOrCreateUser.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) return;

    try {
      const user = await signUp.create({
        firstName: values.nome,
        lastName: values.sobrenome,
        emailAddress: values.email,
      });

      console.log("Usuário criado no Clerk:", user);

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingEmailCode(true);
      setEmail(values.email);
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        return toast.error(err.errors[0]?.message);
      }
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!isLoaded) return;
    try {
      const complete = await signUp?.attemptEmailAddressVerification({ code });

      console.log("Usuário verificado no Clerk:", complete);

      if (!complete?.createdUserId) {
        toast.error("Erro ao obter o ID do usuário no Clerk.");
        return;
      }

      // Criar usuário no MongoDB via tRPC
      await checkOrCreateUser({
        clerkId: complete.createdUserId,
        email,
        nome: form.getValues("nome"),
        sobrenome: form.getValues("sobrenome"),
      });

      await setActive({ session: complete.createdSessionId });
      toast.success("Conta verificada com sucesso!");

      router.push("/");
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        return toast.error(err.errors[0]?.message);
      }
    }
  }

  return (
    <Form {...form}>
      {!pendingEmailCode ? (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <FormField control={form.control} name="nome" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="sobrenome" render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu sobrenome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
          <Button type="submit" className="w-full">
            Cadastrar
          </Button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleVerify}>
          <h1 className="text-2xl font-bold">Validação da conta</h1>
          <p className="text-sm">
            Um código foi enviado para <strong>{email}</strong>. Insira abaixo.
          </p>
          <InputOTP value={code} onChange={setCode} maxLength={6}>
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" className="w-full">Verificar Código</Button>
        </form>
      )}
    </Form>
  );
}
