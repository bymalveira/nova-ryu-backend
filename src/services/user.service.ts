import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { registrarLogAcesso } from './log.service';

export const createUser = async (data: any, requester: any) => { 
    let roleToAssign = data.role || 'ALUNO';

    // Regras de negócio protegidas (requester pode ser undefined em rotas públicas)
    const requesterRole = requester?.role;

    if (roleToAssign === 'ADMIN' && requesterRole !== 'ADMIN') {
        throw new Error('Apenas Administradores podem criar outros Administradores');
    }
    if (roleToAssign === 'PROFESSOR' && requesterRole !== 'ADMIN') {
        throw new Error('Apenas Administradores podem criar outros Professores');
    }
    if (roleToAssign === 'ALUNO' && requesterRole !== 'ADMIN' && requesterRole !== 'PROFESSOR') {
        throw new Error('Apenas professores ou administradores podem cadastrar alunos.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transação com proteção contra dados indefinidos (fallback para string vazia '')
    return await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT set_config('app.current_user_id', ${requester?.sub || ''}, true)`;
        await tx.$executeRaw`SELECT set_config('app.current_user_name', ${requester?.name || ''}, true)`;
        await tx.$executeRaw`SELECT set_config('app.current_user_role', ${requester?.role || ''}, true)`;

        return await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: roleToAssign
            }
        });
    });
};

export const loginUser = async (data: any, ip: string) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (!user) {
        throw new Error('Credenciais Invalidas');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }

    await registrarLogAcesso(user.id, user.email, ip)

    return user;
};

export const deleteUser = async (requester: any, idToDelete: string) => {
    return await prisma.$transaction(async (tx) => {
        // Proteção aplicada aqui também
        await tx.$executeRaw`SELECT set_config('app.current_user_id', ${requester?.sub || ''}, true)`;
        await tx.$executeRaw`SELECT set_config('app.current_user_name', ${requester?.name || ''}, true)`;
        await tx.$executeRaw`SELECT set_config('app.current_user_role', ${requester?.role || ''}, true)`;

        return await tx.user.delete({
            where: { id: idToDelete }
        });
    });
};