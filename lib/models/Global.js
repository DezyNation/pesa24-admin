import { model, models, Schema } from 'mongoose'

const globalSchema = new Schema({
    organisation_code: {
        type: String,
        default: "PESA24"
    },
    aeps_provider: {
        type:String,
        default: "paysprint"
    },
    aeps_status: {
        type: Boolean,
        default: true
    },
    bbps_provider: {
        type: String,
        default: "paysprint"
    },
    bbps_status: {
        type: Boolean,
        default: true
    },
    dmt_provider: {
        type: String,
        default: "paysprint"
    },
    dmt_status: {
        type: Boolean,
        default: true
    },
    recharge_status: {
        type: Boolean,
        default: true
    },
    recharge_provider: {
        type: String,
        default: "paysprint"
    },
    notifications: [{
        title: String,
        content: String,
    }],
    retailer: {
        type: Boolean,
        default: true
    },
    distributor: {
        type: Boolean,
        default: true
    },
    super_distributor: {
        type: Boolean,
        default: true
    },
    default_role: {
        type: String,
        default: "retailer"
    },
})

const Global = models.globaldata || model("globaldata", globalSchema)

export default Global