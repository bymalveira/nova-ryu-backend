import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { userRoutes } from './routes/user.routes';
import adminRoutes from './routes/admin.routes';

const app = new Hono();

app.route('/users', userRoutes);
app.route('/admin', adminRoutes);

serve(app);
