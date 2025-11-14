import express from 'express';
import connectDB from './src/config/db.js';
import morgan from 'morgan';
import PermissionRoutes from './src/routes/Permission.routes.js';
import AuthRoutes from './src/routes/Auth.routes.js';
import ProductRoutes from './src/routes/Product.routes.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';
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
const origenesPermitidos = [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5000',
    'http://localhost:5500',
    'http://localhost:5000'
];

const corsOptions = {
    origin: (origin, callback) => {

        if (!origin) return callback(null, true);

        if (process.env.NODE_ENV !== 'production') {
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }
        }

        if (origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Cliente no permitido'));
    },
    credentials: true
};

app.use(cors(corsOptions));

// sesiones
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboardcat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));


app.use(express.static(path.join(__dirname, 'src', 'public')));

// rutas
app.use('/api/permisos', PermissionRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/products', ProductRoutes);

app.use((req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});