import { prisma } from "../lib/prisma";

export const registrarLogAcesso = async (userId: string, email: string, ip: string) => {
    try {
        await prisma.logAcesso.create({
            data: { userId, email, ip }
        });
    } catch (error) {
        console.error("Erro ao gravar Log acesso: ", error);
    }
};

export const getAcessoLog = async (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        prisma.logAcesso.findMany({
            skip,
            take: limit,
            orderBy: { dataAcesso: 'desc' }
        }),
        prisma.logAcesso.count()
    ]);

    return {
        logs,
        total,
        totalPages: Math.ceil(total / limit)
    };
};