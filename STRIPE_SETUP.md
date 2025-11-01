# Configuración de Stripe para Pagos

## Arquitectura

El frontend (SvelteKit) hace peticiones al backend (Python/FastAPI) que maneja Stripe.

**Flujo:**
1. Usuario hace click en "Actualizar Plan"
2. Frontend llama a `http://localhost:8000/api/stripe/create-checkout-session`
3. Backend crea sesión de Stripe y devuelve URL
4. Frontend redirige a Stripe Checkout
5. Después del pago: redirige a `/pagos/exito` o `/pagos/cancelado`

## 1. Configuración del Backend

El backend debe tener instalado Stripe:

```bash
pip install stripe
```

## 2. Crear cuenta en Stripe

1. Ve a [https://stripe.com](https://stripe.com) y crea una cuenta
2. Activa el modo de prueba (Test Mode)
3. Ve a **Developers > API Keys**
4. Copia tu **Secret Key** (empieza con `sk_test_...`)

## 3. Configurar Variables de Entorno

### Backend (.env)

```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_SUCCESS_URL=http://localhost:5173/pagos/exito
STRIPE_CANCEL_URL=http://localhost:5173/pagos/cancelado
```

### Frontend (.env)

```env
PUBLIC_BACKEND_URL=http://localhost:8000
```

## 4. Crear Productos y Precios en Stripe

### Opción A: Desde el Dashboard de Stripe

1. Ve a **Products** en el dashboard
2. Crea dos productos:
   - **Plan Estándar**: $99/mes
   - **Plan Premium**: $199/mes
3. Copia los **Price IDs** (empiezan con `price_...`)

### Opción B: Usando la API (recomendado)

Crea un script `setup-stripe-products.js`:

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupProducts() {
    // Plan Estándar
    const standardProduct = await stripe.products.create({
        name: 'Plan Estándar',
        description: 'Exámenes ilimitados + Estadísticas avanzadas + Material premium'
    });

    const standardPrice = await stripe.prices.create({
        product: standardProduct.id,
        unit_amount: 9900, // $99.00 en centavos
        currency: 'mxn',
        recurring: {
            interval: 'month'
        }
    });

    // Plan Premium
    const premiumProduct = await stripe.products.create({
        name: 'Plan Premium',
        description: 'Todo de Estándar + Asesorías 1 a 1 + Contenido exclusivo'
    });

    const premiumPrice = await stripe.prices.create({
        product: premiumProduct.id,
        unit_amount: 19900, // $199.00 en centavos
        currency: 'mxn',
        recurring: {
            interval: 'month'
        }
    });

    console.log('Price IDs:');
    console.log('Standard:', standardPrice.id);
    console.log('Premium:', premiumPrice.id);
}

setupProducts();
```

Ejecuta: `node setup-stripe-products.js`

## 5. Actualizar el Código

En `src/routes\api\create-checkout-session\+server.js`:

1. Descomenta las líneas de Stripe
2. Reemplaza `'price_standard'` y `'price_premium'` con tus Price IDs reales

```javascript
body: JSON.stringify({
    priceId: plan === 'standard' ? 'price_1ABC123...' : 'price_1XYZ789...',
    userId: $user.id
})
```

## 6. Configurar Webhooks (Importante para Producción)

Los webhooks te permiten recibir notificaciones cuando un pago se completa:

1. Ve a **Developers > Webhooks** en Stripe
2. Crea un endpoint: `https://tu-dominio.com/api/stripe-webhook`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el **Signing Secret** (empieza con `whsec_...`)

Crea `src/routes/api/stripe-webhook/+server.js`:

```javascript
import Stripe from 'stripe';
import { json } from '@sveltejs/kit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST({ request }) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Manejar el evento
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const userId = session.client_reference_id;
            
            // TODO: Actualizar el plan del usuario en Supabase
            console.log('Payment successful for user:', userId);
            break;

        case 'customer.subscription.updated':
            // Manejar actualización de suscripción
            break;

        case 'customer.subscription.deleted':
            // Manejar cancelación de suscripción
            break;
    }

    return json({ received: true });
}
```

## 7. Actualizar Base de Datos

Agrega campos a la tabla `profiles` en Supabase:

```sql
ALTER TABLE profiles
ADD COLUMN subscription_plan TEXT DEFAULT 'free',
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT,
ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE;
```

## 8. Probar en Modo Test

Usa estas tarjetas de prueba:

- **Éxito**: `4242 4242 4242 4242`
- **Requiere autenticación**: `4000 0025 0000 3155`
- **Declinada**: `4000 0000 0000 9995`

Fecha de expiración: Cualquier fecha futura
CVC: Cualquier 3 dígitos
ZIP: Cualquier código postal

## 9. Portal del Cliente (Opcional)

Permite a los usuarios gestionar su suscripción:

```javascript
// En +server.js
export async function POST({ request }) {
    const { customerId } = await request.json();
    
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${request.headers.get('origin')}/cuenta`,
    });

    return json({ url: session.url });
}
```

## 10. Ir a Producción

1. Cambia a **Live Mode** en Stripe
2. Actualiza las API keys en `.env` con las de producción
3. Configura el webhook en producción
4. Verifica que todo funcione con una compra real pequeña

## Recursos Útiles

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [SvelteKit + Stripe Example](https://github.com/stripe-samples/checkout-one-time-payments)

## Soporte

Si tienes problemas:
1. Revisa los logs en el Dashboard de Stripe
2. Verifica que las API keys sean correctas
3. Asegúrate de que los Price IDs coincidan
4. Revisa la consola del navegador y del servidor
