import Permission from '../models/Permission.model.js';

export default function requirePermission(permissionName) {
  return async function (req, res, next) {
    try {
      if (!req.session || !req.session.userId || !req.session.role) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const role = (req.session.role || '').toLowerCase();
      const name = (permissionName || '').toLowerCase();

      const perm = await Permission.findOne({
        name,
        roles: role
      });

      if (!perm) {
        const err = new Error(`No tenés permiso: ${permissionName}`);
        err.status = 403;
        return next(err);
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}