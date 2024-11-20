import { Schema, model } from 'mongoose';
import { IWebhookRegister } from '../interfaces/AppInterfaces';

const WebhookSchema = new Schema<IWebhookRegister>({
    topic: { type: String, required: true },
    handlers: { type: [Object], required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
})

export default model<IWebhookRegister>('Webhook', WebhookSchema)