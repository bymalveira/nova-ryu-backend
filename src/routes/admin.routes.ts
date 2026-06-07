import { Hono } from "hono";
import { authMiddleware, authorize } from "../middlewares/auth.middleware";
import { getAcessoLog } from "../services/log.service";

const adminRoutes = new Hono();

adminRoutes.use('*', authMiddleware, authorize(['ADMIN']));

adminRoutes.get('/logs', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '5');
    const logs = await getAcessoLog(page, limit);
    return c.json(logs);
})

export default adminRoutes;