import { Context } from 'hono';
import { createUser, deleteUser, loginUser } from '../services/user.service';
import { sign } from 'hono/jwt';
import { userRegisterSchema } from '../schemas/user.schema';
import { getClientIp } from '../utils/ip';

export const registerUser = async (c: Context) => {
    const jwtPayload = c.get('jwtPayload') as any; 
    
    // Passamos o payload inteiro (sub, role, etc)
    const requester = {
        sub: jwtPayload?.sub,
        name: jwtPayload?.name || 'Sistema', 
        role: jwtPayload?.role || 'GUEST'
    };

    const body = await c.req.json();
    const validation = userRegisterSchema.safeParse(body);

    if (!validation.success) {
        return c.json({ message: 'Dados inválidos', errors: validation.error.format() }, 400);
    }

    try {
        // Passando o objeto 'requester' em vez de apenas a string 'requesterRole'
        const user = await createUser(validation.data, requester);
        const { password, ...userWithoutPassword } = user;
        return c.json({ message: 'Usuário criado com sucesso!', user: userWithoutPassword }, 201);
    } catch (error: any) {
        return c.json({ message: error.message }, 403);
    }
};

export const login = async (c: Context) => {
    try {
        const body = await c.req.json();
        const ip = getClientIp(c)
        const user = await loginUser(body, ip);  
        
        const secret = process.env.JWT_SECRET || 'fallback-secret';

        // É AQUI QUE VOCÊ ADICIONA O NAME
        const payload = {
            sub: user.id,
            name: user.name, // Adicionado para que a Trigger de auditoria saiba quem é
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
        };

        const token = await sign(payload, secret);

        const { password, ...userWithoutPassword } = user
    
        return c.json({
            message: 'Login realizado com sucesso!',
            user: userWithoutPassword,
            token
        }, 200);

    } catch (error: any) {
        // Corrigi o erro de digitação de 'menssage' para 'message' abaixo
        return c.json({ message: error.message || 'Erro no login' }, 401);
    }
};

export const deleteUserHandler = async (c: Context) => {
    const payload = c.get('jwtPayload') as any;
    
    // Montando o objeto que o serviço precisa
    const requester = {
        sub: payload.sub,
        name: payload.name || 'Admin',
        role: payload.role
    };

    const idToDelete = c.req.param('id');

    if (!idToDelete) {
        return c.json({ message: 'ID do usuário não fornecido' }, 400);
    }

    try {
        // Agora passamos o objeto completo 'requester'
        await deleteUser(requester, idToDelete);
        return c.json({ message: 'Usuário deletado com sucesso!' });
    } catch (error: any) {
        return c.json({ message: error.message }, 500);
    }
};
