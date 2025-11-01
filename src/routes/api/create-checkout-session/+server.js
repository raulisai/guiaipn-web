import { json } from '@sveltejs/kit';

// TODO: Instalar Stripe con: npm install stripe
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST({ request }) {
    try {
        const { priceId, userId } = await request.json();

        // TODO: Descomentar cuando se instale Stripe
        /*
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${request.headers.get('origin')}/cuenta/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/cuenta`,
            client_reference_id: userId,
            metadata: {
                userId: userId
            }
        });

        return json({ url: session.url });
        */

        // Respuesta temporal para desarrollo
        return json({ 
            url: null,
            message: 'Stripe no configurado. Instala el paquete y configura las variables de entorno.',
            priceId,
            userId
        });

    } catch (error) {
        console.error('Error al crear checkout session:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
