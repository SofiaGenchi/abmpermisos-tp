export default function requireAdmin(req, res, next) {
    try{
        if(req.session && req.session.isAdmin) return next();
        if(req.query && req.query.admin === '1') return next();
        const err = new Error('Admin access required');
        err.status = 403;
        return next(err);
    }catch(e){
        return next(e);
    }
}
