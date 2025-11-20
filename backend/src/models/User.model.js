import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'El campo "username" es obligatorio.'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'El campo "password" es obligatorio.']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cart: [{
        productId: String,
        name: String,
        description: String,
        price: Number,
        quantity: { type: Number, default: 1 }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default model('User', userSchema);
