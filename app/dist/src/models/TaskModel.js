import { model, Schema } from 'mongoose';
import AutoPopulatePlugin from 'mongoose-autopopulate';
import { mongoosePagination } from 'mongoose-paginate-ts';
import { TaskPriority, TaskState } from '../interfaces/TaskInterfaces.js';
const taskSchema = new Schema({
    type: { type: String, required: true },
    filePath: { type: String, required: true },
    fnToCall: { type: String, required: true },
    priority: { type: Number, default: TaskPriority.NORMAL },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', autopopulate: true },
    busId: { type: String, required: true },
    args: { type: Object },
    observations: { type: String, default: 'Recently created' },
    state: { type: String, default: TaskState.ON_HOLD },
    innerData: { type: Object, default: {} },
    outerData: { type: Object, default: {} },
    microstateStatus: { type: Boolean, default: true },
    automated: { type: Boolean, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    scheduleDate: { type: Date },
}, {
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
taskSchema.plugin(AutoPopulatePlugin);
taskSchema.plugin(mongoosePagination);
taskSchema.pre('validate', async function (next) {
    if (typeof this.microstateStatus === 'undefined') {
        await this.updateOne({
            $set: {
                microstateStatus: !!!this.outerData?.results?.some((x) => !x.status)
            }
        });
    }
    next();
});
taskSchema.pre('updateOne', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});
taskSchema.pre('save', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});
export default model('Task', taskSchema);
