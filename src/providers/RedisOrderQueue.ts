import { Injectable } from 'inversify';
import { createClient } from 'redis';
import { IOrderQueue } from './IOrderQueue';
import { Order } from '../domain/Order';

export class RedisOrderQueue implements IOrderQueue {
    private client;
    private readonly queueName = 'orders_email_queue';

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379',
        });
        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.connect();
    }

    async publish(order: Order): Promise<void> {
        await this.client.lpush(this.queueName, JSON.stringify(order));
    }
}