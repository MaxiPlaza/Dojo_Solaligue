import { MercadoPagoConfig, Preference } from 'mercadopago';
import supabase from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (cors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const { planId, title, price, isAnnual } = req.body;

        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
        const preference = new Preference(client);

        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: `PLAN_${planId}`,
                        title: `${title} (${isAnnual ? 'Anual' : 'Mensual'})`,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: `${FRONTEND_URL}/dashboard?status=success&plan_id=${planId}&is_annual=${isAnnual}`,
                    failure: `${FRONTEND_URL}/plans?status=failure`,
                    pending: `${FRONTEND_URL}/plans?status=pending`
                },
                auto_return: 'approved',
                external_reference: user.id.toString(),
                metadata: {
                    user_id: user.id,
                    plan_id: planId,
                    is_annual: isAnnual
                }
            }
        });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('Preference Creation Error:', error);
        const errorDetails = error.response?.data || error.message;
        res.status(500).json({
            error: 'Error al crear la preferencia de pago',
            details: errorDetails
        });
    }
}
