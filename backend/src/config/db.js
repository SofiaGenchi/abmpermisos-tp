import mongoose from "mongoose";

export default async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Base de datos conectada correctamente...')

    }catch(error) {
        console.log(`Error al conectar la base de datos: ${error.message}`)
        process.exit(1);
    }
}