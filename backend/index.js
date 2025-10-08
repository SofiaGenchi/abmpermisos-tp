import express from 'express';
import connectDB from './src/config/db.js';
import morgan from 'morgan';
import PermissionRoutes from './src/routes/Permission.routes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
//base de datos
connectDB();

const app = express();

//crear middlewares
app.use(express.json());
app.use(morgan("dev"));

const origenesPermitidos = ['http://127.0.0.1:5000'];

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

//config del puerto
const PORT = process.env.PORT || 5000;

//rutas
app.use('/api/permisos', PermissionRoutes);

//ponemos en escucha al servidor
app.listen(PORT, () =>{
    console.log(`servidor corriendo en el puerto ${PORT}`);
});