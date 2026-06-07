import { jwt } from 'hono/jwt';
import { Context, Next } from 'hono';

const secret = process.env.JWT_SECRET || 'fallback-secret';

// Middleware de Autenticação (Valida se o token é real)
export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Token não fornecido ou formato inválido' }, 401);
    }

    // Chama o middleware do Hono passando o token limpo
    const token = authHeader.split(' ')[1];
    
    // Configura o middleware manualmente se necessário
    const middleware = jwt({
        secret: process.env.JWT_SECRET || 'fallback-secret',
        alg: 'HS256'
    });

    return middleware(c, next);
};

// Middleware de Autorização (Valida se o cargo tem permissão)
export const authorize = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        // O jwt() do Hono já coloca os dados do payload aqui:
        const payload = c.get('jwtPayload') as { role: string, sub: string };
        
        if (!payload || !roles.includes(payload.role)) {
            return c.json({ message: 'Acesso negado! Permissão insuficiente.' }, 403);
        }

        await next();
    };
};