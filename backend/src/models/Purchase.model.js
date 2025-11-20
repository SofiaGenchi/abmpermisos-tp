import { Schema, model } from "mongoose";

const purchaseDetailsSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        priceUnit: {
            type: Number,
            required: true,
            min: [0, 'El precio unitario debe ser >= 0'],
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad debe ser al menos 1'],
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'El subtotal debe ser >=0 '],
        },
    },
    { _id: false }
);

const purchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    details: {
        type: [purchaseDetailsSchema],
        default: [],
    },
    total: {
        type: Number,
        required: true,
        min: [0, 'El total debe ser >=0'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model('Purchase', purchaseSchema);