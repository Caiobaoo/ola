"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";
import { toast } from "sonner";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { api } from "~/trpc/react"; // Importação do tRPC client

const formSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  code: z.string().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user } = useUser(); // Pegando os dados do usuário autenticado no Clerk
  const [pendingVerification, setPendingVerification] = useState(false);
  const [email, setEmail] = useState("");

  // Hook do tRPC para verificar/cadastrar usuário
  const { mutateAsync: checkOrCreateUser } = api.user.checkOrCreateUser.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isLoaded) return;

    try {
      if (!pendingVerification) {
        const result = await signIn.create({
          identifier: values.email,
          strategy: "email_code",
        });

        if (result.status === "needs_first_factor") {
          setPendingVerification(true);
          setEmail(values.email);
          toast.success("Código enviado para o seu e-mail!");
        }
      } else {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: values.code!,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });

          // Verifica se o usuário já está logado no Clerk
          if (user) {
            const userData = {
              clerkId: user.id, // ✅ Pegando o ID correto do usuário logado
              email: user.primaryEmailAddress?.emailAddress || email,
              nome: user.firstName || "Usuário",
              sobrenome: user.lastName || "Padrão",
            };

            await checkOrCreateUser(userData); // Chama a API do tRPC para verificar/cadastrar o usuário
          }

          toast.success("Login realizado com sucesso!");

          // Redirecionando para a página inicial ("/")
          router.push("/");
        } else {
          toast.error("Código inválido. Tente novamente.");
        }
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        return toast.error(err.errors[0]?.message);
      }
      console.error(err);
      toast.error("Erro ao tentar login. Tente novamente.");
    }
  }

  async function handleResendCode() {
    if (!isLoaded) return;

    try {
      await signIn.create({
        identifier: email,
        strategy: "email_code",
      });

      toast.success("Novo código enviado para seu e-mail!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao reenviar código.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!pendingVerification ? (
          <>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Login</h1>
              <p className="text-sm text-muted-foreground">
                Insira seu email abaixo para acessar sua conta
              </p>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Digite seu email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continuar
            </Button>
            <div className="text-center text-sm">
              <span className="mr-1">Ainda não possui uma conta?</span>
              <Link href="/signup" className="underline underline-offset-4">
                Cadastrar-se
              </Link>
            </div>
          </>
        ) : (
          <>
            <Button
              variant="link"
              type="button"
              className="flex items-center p-1"
              onClick={() => {
                setPendingVerification(false);
                form.reset();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Validação da conta</h1>
            <p className="text-sm">
              Um código foi enviado para <strong>{email}</strong>. Verifique sua caixa de entrada e insira o código abaixo.
            </p>
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <InputOTP value={field.value} onChange={field.onChange} maxLength={6}>
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <Button className="w-full" type="submit">
                Verificar Código
              </Button>
            </div>
            <div className="text-center text-sm">
              <span className="mr-1">Não recebeu o código?</span>
              <Button className="p-2" variant="link" type="button" onClick={handleResendCode}>
                Reenviar Código
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
