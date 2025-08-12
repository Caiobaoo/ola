import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const medicationSchema = z.object({
  nomeMedicamento: z.string().min(1),
  dosagem: z.string().min(1),
  unidadeDosagem: z.string().min(1),
  viaAdministracao: z.string().min(1),
  frequenciaUso: z.string().min(1),
  duracaoTratamento: z.string().optional(),
  unidadeDuracao: z.string().optional(),
  dataInicioTratamento: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date().optional()),
  horarioInicio: z.string().optional(),
});

const prescriptionSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID é obrigatório"),
  doctorName: z.string().min(3),
  doctorCRM: z.string().min(6),
  especialidade: z.string().optional(),
  dataPrescricao: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date().optional()),
  observacao: z.string().optional(),
  medications: z.array(medicationSchema).min(1, "Pelo menos uma medicação é obrigatória"),
});

export const prescriptionRouter = createTRPCRouter({
  create: publicProcedure
    .input(prescriptionSchema)
    .mutation(async ({ input }) => {
      const prescription = await db.prescription.create({
        data: {
          clerkId: input.clerkId,
          doctorName: input.doctorName,
          doctorCRM: input.doctorCRM,
          especialidade: input.especialidade,
          dataPrescricao: input.dataPrescricao,
          observacao: input.observacao,
          ativo: true,
          medications: input.medications,
        },
      });

      return { message: "Prescrição cadastrada com sucesso!", prescription };
    }),

  createOnly: publicProcedure
    .input(z.object({
      clerkId: z.string().min(1),
      doctorName: z.string().min(3),
      doctorCRM: z.string().min(4),
      especialidade: z.string().optional(),
      dataPrescricao: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date().optional()),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const prescription = await db.prescription.create({
        data: {
          clerkId: input.clerkId,
          doctorName: input.doctorName,
          doctorCRM: input.doctorCRM,
          especialidade: input.especialidade,
          dataPrescricao: input.dataPrescricao,
          observacao: input.observacao,
          ativo: true,
          medications: [],
        },
      });

      return prescription;
    }),

  getAllPrescriptions: publicProcedure
    .input(z.object({ clerkId: z.string().min(1) }))
    .query(async ({ input }) => {
      return await db.prescription.findMany({
        where: { clerkId: input.clerkId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getActivePrescriptions: publicProcedure
    .input(z.object({ clerkId: z.string().min(1) }))
    .query(async ({ input }) => {
      return await db.prescription.findMany({
        where: {
          clerkId: input.clerkId,
          ativo: true,
        },
      });
    }),

  updatePrescription: publicProcedure
    .input(prescriptionSchema.extend({ prescriptionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const existingPrescription = await db.prescription.findUnique({
        where: { id: input.prescriptionId },
      });

      if (!existingPrescription) throw new Error("Prescrição não encontrada!");

      const updated = await db.prescription.update({
        where: { id: input.prescriptionId },
        data: {
          clerkId: input.clerkId,
          doctorName: input.doctorName,
          doctorCRM: input.doctorCRM,
          especialidade: input.especialidade,
          dataPrescricao: input.dataPrescricao,
          observacao: input.observacao,
          medications: input.medications,
        },
      });

      return { message: "Prescrição atualizada com sucesso!", prescription: updated };
    }),

  inactivatePrescription: publicProcedure
    .input(z.object({
      prescriptionId: z.string().min(1),
      justification: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const existingPrescription = await db.prescription.findUnique({
        where: { id: input.prescriptionId },
      });

      if (!existingPrescription) throw new Error("Prescrição não encontrada!");

      const updated = await db.prescription.update({
        where: { id: input.prescriptionId },
        data: { ativo: false },
      });

      return { message: "Prescrição inativada com sucesso", prescription: updated };
    }),

  activatePrescription: publicProcedure
    .input(z.object({ prescriptionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const existingPrescription = await db.prescription.findUnique({
        where: { id: input.prescriptionId },
      });

      if (!existingPrescription) throw new Error("Prescrição não encontrada!");

      const updated = await db.prescription.update({
        where: { id: input.prescriptionId },
        data: { ativo: true },
      });

      return { message: "Prescrição ativada com sucesso", prescription: updated };
    }),

  finalizePrescription: publicProcedure
    .input(z.object({ prescriptionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const prescription = await db.prescription.findUnique({
        where: { id: input.prescriptionId },
      });

      if (!prescription) {
        throw new Error("Prescrição não encontrada.");
      }

      return { message: "Prescrição finalizada com sucesso", prescription };
    }),


    addMedication: publicProcedure
  .input(z.object({
    prescriptionId: z.string().min(1),
    medication: medicationSchema,
  }))
  .mutation(async ({ input }) => {
    const existingPrescription = await db.prescription.findUnique({
      where: { id: input.prescriptionId },
    });

    if (!existingPrescription) {
      throw new Error("Prescrição não encontrada!");
    }

    const updated = await db.prescription.update({
      where: { id: input.prescriptionId },
      data: {
        medications: {
          push: input.medication,
        },
      },
    });

    return { message: "Medicação adicionada com sucesso!", prescription: updated };
  }),


  getAllDoctors: publicProcedure.query(async () => {
    const doctors = await db.prescription.findMany({
      where: {
        doctorName: {
          not: undefined, 
        },
      },
      distinct: ["doctorName"],
      select: { doctorName: true },
    });
  
    return doctors.map((d) => d.doctorName);
  }),
  
  
  getAllSpecialties: publicProcedure.query(async () => {
    const specialties = await db.prescription.findMany({
      where: {
        especialidade: {
          not: null,
        },
      },
      distinct: ["especialidade"],
      select: { especialidade: true },
    });
  
    return specialties.map((s) => s.especialidade!);
  })
  

});
