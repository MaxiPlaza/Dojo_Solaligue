import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { authenticateToken } from '../middleware/authMiddleware.js';
import db from '../database.js';

const router = express.Router();

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

router.post('/create_preference', authenticateToken, async (req, res) => {
    try {
        const { planId, title, price, isAnnual } = req.body;
        console.log('--- Generating Mercado Pago Preference ---');
        console.log('Plan:', title, '| Price:', price, '| User ID:', req.user.id);

        const preference = new Preference(client);

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
                    success: `http://localhost:5173/dashboard?status=success&plan_id=${planId}&is_annual=${isAnnual}`,
                    failure: `http://localhost:5173/plans?status=failure`,
                    pending: `http://localhost:5173/plans?status=pending`
                },
                auto_return: 'approved',
                external_reference: req.user.id.toString(),
                metadata: {
                    user_id: req.user.id,
                    plan_id: planId,
                    is_annual: isAnnual
                }
            }
        });

        console.log('Preference Created ID:', result.id);

        console.log('Preference Created Successfully:', result.id);
        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('--- Preference Creation Error (MP Restricted) ---');
        console.error(error);
        const errorDetails = error.response?.data || error.message;
        res.status(500).json({
            error: 'Error al crear la preferencia de pago',
            details: errorDetails
        });
    }
});

// Endpoint to confirm payment and update user plan (Simulated or triggered by frontend on redirect)
router.post('/confirm_payment', authenticateToken, async (req, res) => {
    const { plan_id, is_annual } = req.body;
    const userId = req.user.id;

    try {
        // Calculate end date
        const endDate = new Date();
        if (is_annual === 'true' || is_annual === true) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const formattedDate = endDate.toISOString();

        db.prepare(`
            UPDATE users 
            SET plan_id = ?, subscription_end_date = ? 
            WHERE id = ?
        `).run(plan_id, formattedDate, userId);

        res.json({ message: 'Suscripción actualizada correctamente', end_date: formattedDate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la suscripción' });
    }
});

export default router;
