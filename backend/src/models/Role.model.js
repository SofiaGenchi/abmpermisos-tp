import { Schema, model} from 'mongoose';

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    date: { type: Date, default: Date.now }
});

export default model('Role', roleSchema);