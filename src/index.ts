import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { userRoutes } from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors({
    origin: 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowHeaders: ['Content-Type', 'Authorization']
}));

app.route('/users', userRoutes);
app.route('/admin', adminRoutes);

serve({
    fetch: app.fetch,
    port: 4000
});
