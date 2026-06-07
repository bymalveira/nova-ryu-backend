import { Hono } from 'hono';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { UserPayload } from '../types/auth';
import { registerUser, login } from '../controllers/user.controller';
import { getAcessoLog } from '../services/log.service';
import { prisma } from '../lib/prisma';

const userRoutes = new Hono();

userRoutes.get('/profile', authMiddleware, (c) => {
    const payload = c.get('jwtPayload') as UserPayload
    return c.json({
        mensage: 'Acesso autorizado',
        userId: payload.sub
    });
});

userRoutes.post('/logout', authMiddleware, async (c) => {
    const payload = c.get('jwtPayload') as { sub: string };
    const ip = c.req.header('x-forwarded-for') || 'unknown';


    return c.json({
        menssage: 'Logout realizado com sucesso!'
    });
});

userRoutes.post('/register', authMiddleware, authorize(['ADMIN', 'PROFESSOR']), registerUser);

userRoutes.post('/login', login);

userRoutes.get('/dashboard', authMiddleware, authorize(['ADMIN']), async (c) => {
    const totalUsers = await prisma.user.count();

    const latestUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createAt: 'desc' },
        select: { id: true, name: true, email: true, role: true }
    });

    return c.json({
        menssage: 'Dashboard Carregado!',
        stats: {
            totalUsers,
            latestUsers
        }
    });
});

export { userRoutes };