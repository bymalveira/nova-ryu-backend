import { z } from 'zod';

export const userRegisterSchema = z.object({
    name: z.string().min(3, 'O nome deve possuir pelo menos 3 caracteres'),
    email: z.string().email('E-mail invalido'),
    password: z.string().min(6, 'A senha deve possuir pelo menos 6 caracteres'),
    role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO']).optional()
})