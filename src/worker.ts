import 'reflect-metadata';
import { createClient } from 'redis';
import { container } from './container/container';
import { NotificationService } from './services/NotificationService';
import { Order } from './domain/Order';
import logger from './lib/logger';

const QUEUE_NAME = 'orders_email_queue';

async function startWorker() {
    const client = createClient({
        url: process.env.REDIS_URL || 'redis://redis:6379',
    });

    client.on('error', (err) => logger.error('erro no cliente Redis do Worker:', err));

    await client.connect();
    logger.info('aguardando pedidos na fila...');

    const notificationService = container.get(NotificationService);

    while (true) {
        try {
            const result = await client.brPop(QUEUE_NAME, 0);
            if (result) {
                const order: Order = JSON.parse(result.element);
                logger.info(`processando envio de e-mail | pedido: ${order.id}`);

                await notificationService.orderConfirmed(order);
                logger.info(`E-mail enviado | pedido: ${order.id} `);
            }
        } catch (error) {
            logger.error('Falha ao processar mensagem da fila:', error);
        }
    }
}

startWorker();