import { Schema, model } from 'mongoose';
const WebhookSchema = new Schema({
    topic: { type: String, required: true },
    handlers: { type: [Object], required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});
export default model('Webhook', WebhookSchema);
