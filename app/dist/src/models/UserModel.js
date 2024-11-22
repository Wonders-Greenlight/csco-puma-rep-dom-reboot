import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
    userName: { type: String, required: true },
    roles: { type: [Number], required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    password: { type: String, required: true },
    ip: { type: String }
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
});
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
export default model('User', UserSchema);
