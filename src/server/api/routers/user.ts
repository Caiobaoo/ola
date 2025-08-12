import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const userRouter = createTRPCRouter({
  checkOrCreateUser: publicProcedure
    .input(
      z.object({
        clerkId: z.string().min(1),
        email: z.string().email(),
        nome: z.string().min(1),
        sobrenome: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      let user = await db.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            clerkId: input.clerkId,
            email: input.email,
            nome: input.nome,
            sobrenome: input.sobrenome,
          },
        });
      }

      return { message: "Usuário sincronizado com sucesso", user };
    }),

  getAllUsers: publicProcedure.query(async () => {
    const users = await db.user.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        clerkId: true,
      },
    });

    return users;
  }),

  getUserByClerkId: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { clerkId: input.clerkId },
      });

      if (!user) {
        throw new Error("Usuário não encontrado.");
      }

      return user;
    }),

  updateUser: publicProcedure
    .input(
      z.object({
        clerkId: z.string().min(1),
    

        telefone: z
          .string()
          .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),

        genero: z.string().min(1),
        peso: z.number(),
        altura: z.number(),
        tipoSanguineo: z.string().min(1),
        doencas: z.array(z.string()).optional(),
        alergias: z.array(z.string()).optional(),

        cep: z.string().min(1),
        logradouro: z.string().min(1),
        bairro: z.string().min(1),
        numero: z.string().optional(),
        cidade: z.string().min(1),
        uf: z.string().min(1),

        ativo: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: { clerkId: input.clerkId },
        data: {

          telefone: input.telefone,

          genero: input.genero,
          peso: input.peso,
          altura: input.altura,
          tipoSanguineo: input.tipoSanguineo,
          doencas: input.doencas,
          alergias: input.alergias,

          cep: input.cep,
          logradouro: input.logradouro,
          bairro: input.bairro,
          numero: input.numero,
          cidade: input.cidade,
          uf: input.uf,

          ativo: input.ativo,
        },
      });

      return { message: "Usuário atualizado com sucesso", user };
    }),


    updateInitialUserInfo: publicProcedure
    .input(
      z.object({
        clerkId: z.string().min(1),
        apelido: z.string().min(1),
        nomecompleto: z.string().min(1),
        datanascimento: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: { clerkId: input.clerkId },
        data: {
          apelido: input.apelido,
          nomecompleto: input.nomecompleto,
          datanascimento: new Date(input.datanascimento),
        },
      });
  
      return { message: "Informações iniciais atualizadas com sucesso", user };
    }),
  

  deleteUser: publicProcedure
    .input(z.object({ clerkId: z.string() }))
    .mutation(async ({ input }) => {
      await db.user.delete({
        where: { clerkId: input.clerkId },
      });

      return { message: "Usuário removido com sucesso" };
    }),
});
