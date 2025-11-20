import { Schema, model } from 'mongoose';

const permissionSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El campo "name" es obligatorio.'],
        unique: true,
        trim: true,
        lowercase: true
    },
    description: { type: String, default: '' },
    roles: { type: [String], default: ['user'] },
    createdAt: { type: Date, default: Date.now }
});

permissionSchema.pre('save', function(next){
    if(this.name) this.name = this.name.trim().toLowerCase();
    if(this.roles && Array.isArray(this.roles)){
        this.roles = this.roles.map(r => (r||'').toString().trim().toLowerCase()).filter(Boolean);
    }
    next();
});

export default model('Permission', permissionSchema);