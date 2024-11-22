import { model, Schema } from 'mongoose';
import AutoPopulatePlugin from 'mongoose-autopopulate';
import { mongoosePagination } from 'mongoose-paginate-ts';
const locationSchema = new Schema({
    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: false },
    shopifyId: { type: Number },
    erpId: { type: String },
    email: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});
locationSchema.plugin(AutoPopulatePlugin);
locationSchema.plugin(mongoosePagination);
locationSchema.pre('updateOne', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});
locationSchema.pre('save', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});
export default model('Location', locationSchema);
