import { MercadoPagoConfig, Preference } from 'mercadopago';
import supabase from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const user = requireAuth(req, res);
    if (!user) return;

    const { url } = req;
    const path = url.split('?')[0];

    try {
        // POST /api/payment/create_preference
        if (path.endsWith('/create_preference')) {
            const { planId, title, price, isAnnual } = req.body;
            const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
            const preference = new Preference(client);
            const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

            const result = await preference.create({
                body: {
                    items: [{
                        id: `PLAN_${planId}`,
                        title: `${title} (${isAnnual ? 'Anual' : 'Mensual'})`,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'ARS'
                    }],
                    back_urls: {
                        success: `${FRONTEND_URL}/dashboard?status=success&plan_id=${planId}&is_annual=${isAnnual}`,
                        failure: `${FRONTEND_URL}/plans?status=failure`,
                        pending: `${FRONTEND_URL}/plans?status=pending`
                    },
                    auto_return: 'approved',
                    external_reference: user.id.toString(),
                    metadata: { user_id: user.id, plan_id: planId, is_annual: isAnnual }
                }
            });
            return res.json({ id: result.id, init_point: result.init_point });
        }

        // POST /api/payment/confirm_payment
        if (path.endsWith('/confirm_payment')) {
            const { plan_id, is_annual } = req.body;
            const endDate = new Date();
            if (is_annual === 'true' || is_annual === true) endDate.setFullYear(endDate.getFullYear() + 1);
            else endDate.setMonth(endDate.getMonth() + 1);
            const formattedDate = endDate.toISOString();

            const { error } = await supabase.from('users').update({ plan_id: plan_id, subscription_end_date: formattedDate }).eq('id', user.id);
            if (error) throw error;
            return res.json({ message: 'Suscripción actualizada correctamente', end_date: formattedDate });
        }

        return res.status(404).json({ error: 'Not Found' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}
