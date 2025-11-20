export default function requireAdmin(req, res, next) {
    try{
        
        if(req.session && (req.session.isAdmin || req.session.role === 'admin')) return next();
        
        const err = new Error('Admin access required');
        err.status = 403;
        return next(err);
    }catch(e){
        return next(e);
    }
}
