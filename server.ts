/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * STEMMate Namibia Full-Stack Server
 * Express Backend with Vite middlewares and strict server-side RBAC validation
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { INITIAL_ACTIVITIES, INITIAL_PLANS, INITIAL_USERS, INITIAL_AUDIT_LOGS, INITIAL_INVENTORY, OUTREACH_METRICS } from './src/data/mockData';
import { hasPermission, sanitizeDataMinimisation, ROLES_METADATA, toCanonicalRole, StandardPermission } from './src/security/permissions';
import { UserAccount, SessionPlan, SecurityAuditEvent, UserRole } from './src/types';

// In-memory server-authoritative state
let serverUsers: UserAccount[] = [...INITIAL_USERS];
let serverPlans: SessionPlan[] = [...INITIAL_PLANS];
let serverAuditLogs: SecurityAuditEvent[] = [...INITIAL_AUDIT_LOGS];

export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
}

/**
 * Authentication Middleware: Validates user session token or identification header
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const customUserId = req.headers['x-stemmate-user-id'] as string;
  const customRole = req.headers['x-stemmate-role'] as string;

  let resolvedUser: UserAccount | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Token is encoded as `session_<userId>` in our offline-first protocol
    const userId = token.replace('session_', '');
    resolvedUser = serverUsers.find(u => u.id === userId);
  } else if (customUserId) {
    resolvedUser = serverUsers.find(u => u.id === customUserId);
  } else if (customRole) {
    resolvedUser = serverUsers.find(u => u.role === customRole && u.status === 'active');
  }

  if (!resolvedUser) {
    return res.status(401).json({
      error: 'Authentication required. Please provide valid authorization credentials.',
    });
  }

  if (resolvedUser.status === 'deactivated') {
    return res.status(403).json({
      error: 'Account deactivated. Access has been revoked by the System Administrator.',
    });
  }

  req.user = resolvedUser;
  next();
}

/**
 * Permission Middleware Factory: Enforces strict granular permission on endpoints
 */
export function requirePermission(permission: StandardPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isAuthorized = hasPermission(req.user.role, permission);
    if (!isAuthorized) {
      return res.status(403).json({
        error: `Access Denied: Role "${req.user.role}" does not have "${permission}" permission.`,
      });
    }

    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'STEMMate Namibia RBAC API', version: '1.2.0' });
  });

  // 1. Authentication Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email or staff identifier is required' });
    }

    const trimmed = String(email).trim().toLowerCase();
    const user = serverUsers.find(u => u.email.toLowerCase() === trimmed);

    if (!user) {
      return res.status(401).json({ error: 'User account not found in station directory.' });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({ error: 'Account deactivated. Access revoked by administrator.' });
    }

    const canonical = toCanonicalRole(user.role);
    const roleMeta = ROLES_METADATA[canonical];

    // Emit audit event
    serverAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'login_success',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Authenticated login on station ${user.stationCode}.`,
      stationCode: user.stationCode,
    });

    res.json({
      token: `session_${user.id}`,
      user: sanitizeDataMinimisation(user),
      permissions: roleMeta.allowedPermissions,
    });
  });

  // 2. User Management (System Administrator)
  app.get('/api/users', authenticateToken, requirePermission('users.view'), (req, res) => {
    res.json(serverUsers.map(u => sanitizeDataMinimisation(u)));
  });

  app.post('/api/users', authenticateToken, requirePermission('users.create'), (req: AuthenticatedRequest, res) => {
    const { name, email, role, stationCode } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const trimmed = String(email).trim().toLowerCase();
    if (serverUsers.some(u => u.email.toLowerCase() === trimmed)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      name: String(name).trim(),
      email: trimmed,
      role: role as UserRole,
      canonicalRole: toCanonicalRole(role),
      stationCode: stationCode || 'STATION-01',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActive: 'Never logged in',
      assignedPlanIds: [],
    };

    serverUsers.unshift(newUser);

    serverAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'user_created',
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      targetUserId: newUser.id,
      targetUserName: newUser.name,
      details: `Provisioned account for ${newUser.name} (${newUser.role}).`,
      stationCode: req.user!.stationCode,
    });

    res.status(201).json(sanitizeDataMinimisation(newUser));
  });

  app.put('/api/users/:id/role', authenticateToken, requirePermission('roles.assign'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const { newRole } = req.body;

    const target = serverUsers.find(u => u.id === id);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldRole = target.role;
    target.role = newRole as UserRole;
    target.canonicalRole = toCanonicalRole(newRole);

    serverAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'role_assigned',
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      targetUserId: target.id,
      targetUserName: target.name,
      details: `Reassigned ${target.name} from "${oldRole}" to "${newRole}".`,
      stationCode: req.user!.stationCode,
    });

    res.json(sanitizeDataMinimisation(target));
  });

  app.put('/api/users/:id/status', authenticateToken, requirePermission('users.deactivate'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own active session.' });
    }

    const target = serverUsers.find(u => u.id === id);
    if (!target) {
      return res.status(404).json({ error: 'User not found' });
    }

    target.status = target.status === 'active' ? 'deactivated' : 'active';

    serverAuditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: target.status === 'active' ? 'account_activated' : 'account_deactivated',
      actorId: req.user!.id,
      actorName: req.user!.name,
      actorRole: req.user!.role,
      targetUserId: target.id,
      targetUserName: target.name,
      details: `Toggled status to ${target.status} for ${target.name}.`,
      stationCode: req.user!.stationCode,
    });

    res.json(sanitizeDataMinimisation(target));
  });

  // 3. Session Plans (Record Ownership & Access Control)
  app.get('/api/plans', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const canonical = toCanonicalRole(user.role);

    let accessiblePlans: SessionPlan[] = [];

    if (canonical === 'STEM_FACILITATOR') {
      // Facilitators see their own plans
      accessiblePlans = serverPlans.filter(p => !p.ownerId || p.ownerId === user.id);
    } else if (canonical === 'VOLUNTEER_ASSISTANT') {
      // Volunteers see plans assigned to them
      accessiblePlans = serverPlans.filter(p => p.assignedVolunteerId === user.id || p.assignedVolunteerName?.includes(user.name));
    } else if (canonical === 'OUTREACH_COORDINATOR' || canonical === 'SCHOOL_MANAGEMENT') {
      // Coordinators and Management see shared plans for review
      accessiblePlans = serverPlans.filter(p => p.isSharedWithCoordinator || p.isSharedWithManagement || p.status === 'synced');
    } else {
      accessiblePlans = [...serverPlans];
    }

    res.json(accessiblePlans.map(p => sanitizeDataMinimisation(p)));
  });

  app.post('/api/plans', authenticateToken, requirePermission('sessions.create'), (req: AuthenticatedRequest, res) => {
    const planData = req.body;
    if (!planData.title || !planData.activityId) {
      return res.status(400).json({ error: 'Plan title and activityId are required' });
    }

    const sanitized = sanitizeDataMinimisation({
      ...planData,
      id: `plan-${Date.now()}`,
      ownerId: req.user!.id,
      ownerName: req.user!.name,
      ownerRole: req.user!.role,
      status: 'synced',
    });

    serverPlans.unshift(sanitized);

    res.status(201).json(sanitized);
  });

  app.put('/api/plans/:id', authenticateToken, requirePermission('sessions.edit_own'), (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const plan = serverPlans.find(p => p.id === id);

    if (!plan) {
      return res.status(404).json({ error: 'Session plan not found' });
    }

    // Strict record ownership enforcement
    if (plan.ownerId && plan.ownerId !== req.user!.id) {
      return res.status(403).json({
        error: `Access Denied: You cannot modify session plan "${plan.title}" owned by ${plan.ownerName || 'another facilitator'}.`,
      });
    }

    Object.assign(plan, sanitizeDataMinimisation(req.body));
    res.json(sanitizeDataMinimisation(plan));
  });

  // 4. Outreach Aggregates (Strict Zero PII)
  app.get('/api/participation', authenticateToken, requirePermission('participation.view_aggregate'), (req, res) => {
    res.json(sanitizeDataMinimisation(OUTREACH_METRICS));
  });

  // 5. Equipment Inventory & Custody
  app.get('/api/equipment', authenticateToken, requirePermission('equipment.view'), (req, res) => {
    res.json(INITIAL_INVENTORY);
  });

  // 6. Security Audit Logs
  app.get('/api/audit-logs', authenticateToken, requirePermission('security.audit.view'), (req, res) => {
    res.json(serverAuditLogs);
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[STEMMate Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('[STEMMate Server] Startup error:', err);
  });
}
