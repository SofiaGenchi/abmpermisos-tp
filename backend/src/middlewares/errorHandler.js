const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    let statusCode = err.status || 500;

    //error de ID invalido
    if(err.name === 'CastError'){
        const message = `Recurso no encontrado. ID invalido`;
        statusCode = 404;
        error = { name: 'NotFound', message };
    }

    //error de clave duplicada
    if(err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        const message = `Valor de campo duplicado: ${field} ya existe.`;
        statusCode = 400;
        error = { name: 'DuplicateKeyError', message};
    }

    // error de validacion
    if(err.name === 'ValidationError'){
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        statusCode = 400;
        error = { name: 'ValidationError', message };
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: error.message || 'Error del Servidor',
    });
};

export default errorHandler;