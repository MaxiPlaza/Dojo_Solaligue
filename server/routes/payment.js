import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

router.post('/create_preference', authenticateToken, async (req, res) => {
    try {
        const { planId, title, price } = req.body;

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: title,
                        quantity: 1,
                        unit_price: Number(price),
                        currency_id: 'ARS'
                    }
                ],
                back_urls: {
                    success: 'http://localhost:5173/dashboard?status=success',
                    failure: 'http://localhost:5173/plans?status=failure',
                    pending: 'http://localhost:5173/plans?status=pending'
                },
                auto_return: 'approved',
                external_reference: req.user.id.toString(), // To identify user on webhook
            }
        });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating preference' });
    }
});

export default router;
