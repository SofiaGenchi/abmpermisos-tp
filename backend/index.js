import express from 'express';
import connectDB from './src/config/db.js';
import morgan from 'morgan';
import PermissionRoutes from './src/routes/Permission.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import errorHandler from './src/middlewares/errorHandler.js';

//se carga las variables de entorno
dotenv.config();

//base de datos
connectDB();

const app = express();

//crear middlewares
app.use(express.json());
app.use(morgan("dev"));

// index.js
const origenesPermitidos = ['http://127.0.0.1:5500', 'http://127.0.0.1:5000'];

const corsOptions = {
    origin: (origin, callback) => {
        if(!origin || origenesPermitidos.includes(origin)){
            callback(null, true)
        }else {
            callback(new Error('Cliente no permitido'));
        }
    }
}
app.use(cors(corsOptions));

//rutas
app.use('/api/permisos', PermissionRoutes);

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 400;
    next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});