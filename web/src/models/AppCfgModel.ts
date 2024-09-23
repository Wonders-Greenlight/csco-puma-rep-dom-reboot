import { model, Schema } from 'mongoose'
import AutoPopulatePlugin from 'mongoose-autopopulate'
import { AppMode, IAppConfig } from '../interfaces/AppInterfaces.js'
import { GqlProductStatus } from '../interfaces/ShopifyInterfaces.js'

const appConfigSchema = new Schema<IAppConfig>({
    mode: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
    apiSandboxUrl: { type: String, default: '' },
    apiProductionUrl: { type: String, default: '' },
    apiSandboxSecondaryUrl: { type: String, default: '' },
    apiProductionSecondaryUrl: { type: String, default: '' },
    apiSandboxKey: { type: String, default: '' },
    apiProductionKey: { type: String, default: '' },
    dbName: { type: String, default: '' },
    dbOrdersName: { type: String, default: '' },
    dbUserName: { type: String, default: '' },
    dbPassword: { type: String, default: '' },
    apiBrandIds: { type: [String], default: [] },
    cronMinutesPriceUpdateTask: { type: Number, default: 5 },
    cronMinutesStockUpdateTask: { type: Number, default: 5 },
    cronMinutesProductCreateUpdateTask: { type: Number, default: 5 },
    cronPriceUpdateRoutineEnabled: { type: Boolean, default: false },
    cronStockUpdateRoutineEnabled: { type: Boolean, default: false },
    cronProductUpdateRoutineEnabled: { type: Boolean, default: false },
    productCreationMode: { type: String, default: GqlProductStatus.DRAFT },
    productRetrieveOnlyWebItem: { type: Boolean, default: true },
    productRetrieveOnlyAvailable: { type: Boolean, default: true },
}, {
    virtuals: true,
    toJSON: { virtuals: true }
})
appConfigSchema.plugin(AutoPopulatePlugin)

appConfigSchema.virtual('appModeCfg').get(function() {
    const erpApiUrl = this.mode === AppMode.SANDBOX
        ? this.apiSandboxUrl
        : this.apiProductionUrl
    const erpApiSecondaryUrl = this.mode === AppMode.SANDBOX
        ? this.apiSandboxSecondaryUrl
        : this.apiProductionSecondaryUrl
    const erpApiKey = this.mode === AppMode.SANDBOX
        ? this.apiSandboxKey
        : this.apiProductionKey
    
    return {
        apiUrl: erpApiUrl,
        apiSecondaryUrl: erpApiSecondaryUrl,
        apiKey: erpApiKey,
    }
})

appConfigSchema.virtual('isProduction').get(function() {
    return this.mode === AppMode.PRODUCTION
})

appConfigSchema.pre('updateOne', function(next) {
    this.set({ updatedAt: Date.now() })
    next()
})

appConfigSchema.pre('save', function(next) {
    this.set({ updatedAt: Date.now() })
    next()
})

export default model<IAppConfig>('AppConfig', appConfigSchema)
