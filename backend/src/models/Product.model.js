import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El campo "name" es obligatorio.'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'El campo "price" es obligatorio.'],
        min: [0, 'El precio debe ser igual o mayor a 0']
    },
    createdAt: { type: Date, default: Date.now }
});

export default model('Product', productSchema);
