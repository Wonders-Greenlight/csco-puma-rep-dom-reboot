import { model, Schema } from 'mongoose'
import AutoPopulatePlugin from 'mongoose-autopopulate'
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts'
import { IEvent, TaskState } from '../interfaces/TaskInterfaces.js'

const eventSchema = new Schema<IEvent>({
    type: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    observations: { type: String, default: 'Recently created' },
    state: { type: String, default: TaskState.ON_HOLD },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
})
eventSchema.plugin(AutoPopulatePlugin)
eventSchema.plugin(mongoosePagination)

eventSchema.pre('updateOne', function(next) {
    this.set({ updatedAt: Date.now() })
    next()
})

eventSchema.pre('save', function(next) {
    this.set({ updatedAt: Date.now() })
    next()
})

export default model<IEvent, Pagination<IEvent>>('Event', eventSchema)
