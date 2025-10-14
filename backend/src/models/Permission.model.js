import { Schema, model } from "mongoose";

const permissionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true, //asegurar que el nombre sea unico
        trim: true  // elimina espacios
    },
    description: String,
    date: {type: Date, default: Date.now}
});

export default model('Permission', permissionSchema);