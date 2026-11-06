/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces server-side permissions for ADMIN, EDITOR, and AUTHOR.
 */

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] permissions. Current role is '${userRole}'.`
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireEditorOrAdmin = requireRole(['admin', 'editor']);
export const requireAnyRole = requireRole(['admin', 'editor', 'author']);

