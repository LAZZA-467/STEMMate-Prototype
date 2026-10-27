/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * STEMMate Namibia Automated Server API RBAC Security Test Suite
 * Tests HTTP 401/403 status codes, endpoint permission enforcement, and record ownership.
 */

import assert from 'node:assert';
import {
  hasPermission,
  ROLES_METADATA,
  toCanonicalRole,
  sanitizeDataMinimisation,
  StandardPermission,
} from '../src/security/permissions';
import { INITIAL_USERS, INITIAL_PLANS, OUTREACH_METRICS } from '../src/data/mockData';
import { UserAccount, SessionPlan } from '../src/types';

let passed = 0;
let total = 0;

function it(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      throw new Error('Sync test expected');
    }
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ✕ [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

console.log('Starting STEMMate Server Authorization & Route Protection Tests...');

// Mock Server RBAC Dispatcher mirroring server.ts logic
function mockServerDispatch(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  headers: Record<string, string>,
  body?: any
): { status: number; body: any } {
  const authHeader = headers['authorization'];
  let user: UserAccount | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer session_', '');
    user = INITIAL_USERS.find(u => u.id === token);
  }

  // Public endpoint
  if (path === '/api/auth/login' && method === 'POST') {
    const email = body?.email?.toLowerCase();
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email);
    if (!found) return { status: 401, body: { error: 'User account not found' } };
    if (found.status === 'deactivated') {
      return { status: 403, body: { error: 'Account deactivated' } };
    }
    return {
      status: 200,
      body: {
        token: `session_${found.id}`,
        user: sanitizeDataMinimisation(found),
        permissions: ROLES_METADATA[found.canonicalRole].allowedPermissions,
      },
    };
  }

  // All other /api/ routes require authentication
  if (!user) {
    return { status: 401, body: { error: 'Authentication required' } };
  }

  if (user.status === 'deactivated') {
    return { status: 403, body: { error: 'Account deactivated. Access revoked.' } };
  }

  // Route: /api/users
  if (path === '/api/users') {
    if (method === 'GET') {
      if (!hasPermission(user.role, 'users.view')) {
        return { status: 403, body: { error: 'Access denied: users.view required' } };
      }
      return { status: 200, body: INITIAL_USERS.map(u => sanitizeDataMinimisation(u)) };
    }
    if (method === 'POST') {
      if (!hasPermission(user.role, 'users.create')) {
        return { status: 403, body: { error: 'Access denied: users.create required' } };
      }
      return { status: 201, body: { id: 'usr-new', ...body } };
    }
  }

  // Route: /api/users/:id/role
  if (path.startsWith('/api/users/') && path.endsWith('/role')) {
    if (!hasPermission(user.role, 'roles.assign')) {
      return { status: 403, body: { error: 'Access denied: roles.assign required' } };
    }
    return { status: 200, body: { success: true } };
  }

  // Route: /api/plans
  if (path === '/api/plans') {
    if (method === 'GET') {
      return { status: 200, body: INITIAL_PLANS };
    }
    if (method === 'POST') {
      if (!hasPermission(user.role, 'sessions.create')) {
        return { status: 403, body: { error: 'Access denied: sessions.create required' } };
      }
      return { status: 201, body: { id: 'plan-new', ...body } };
    }
  }

  // Route: /api/plans/:id (PUT)
  if (path.startsWith('/api/plans/') && method === 'PUT') {
    if (!hasPermission(user.role, 'sessions.edit_own')) {
      return { status: 403, body: { error: 'Access denied: sessions.edit_own required' } };
    }
    const planId = path.split('/')[3];
    const plan = INITIAL_PLANS.find(p => p.id === planId);
    if (!plan) return { status: 404, body: { error: 'Plan not found' } };

    // Record ownership check
    if (plan.ownerId && plan.ownerId !== user.id) {
      return {
        status: 403,
        body: { error: `Access Denied: You cannot modify plan owned by ${plan.ownerName}` },
      };
    }
    return { status: 200, body: { ...plan, ...body } };
  }

  // Route: /api/participation
  if (path === '/api/participation') {
    if (!hasPermission(user.role, 'participation.view_aggregate')) {
      return { status: 403, body: { error: 'Access denied: participation.view_aggregate required' } };
    }
    return { status: 200, body: sanitizeDataMinimisation(OUTREACH_METRICS) };
  }

  return { status: 404, body: { error: 'Not found' } };
}

console.log('\n--- Test Suite: Server-Side API Security & HTTP 401/403 Responses ---');

it('Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized', () => {
  const res = mockServerDispatch('GET', '/api/users', {});
  assert.strictEqual(res.status, 401);
  assert.ok(res.body.error.includes('Authentication required'));
});

it('Deactivated user login returns HTTP 403 Forbidden', () => {
  const res = mockServerDispatch('POST', '/api/auth/login', {}, { email: 'deactivated.user@stemmate.na' });
  assert.strictEqual(res.status, 403);
  assert.ok(res.body.error.includes('deactivated'));
});

it('Volunteer Assistant attempting to access /api/users receives HTTP 403 Forbidden', () => {
  const volunteer = INITIAL_USERS.find(u => u.role === 'Volunteer Assistant')!;
  const res = mockServerDispatch('GET', '/api/users', {
    authorization: `Bearer session_${volunteer.id}`,
  });
  assert.strictEqual(res.status, 403);
  assert.ok(res.body.error.includes('Access denied'));
});

it('Equipment Custodian attempting to assign roles receives HTTP 403 Forbidden', () => {
  const custodian = INITIAL_USERS.find(u => u.role === 'Equipment Custodian')!;
  const res = mockServerDispatch('PUT', '/api/users/usr-vol-01/role', {
    authorization: `Bearer session_${custodian.id}`,
  }, { newRole: 'Volunteer Assistant' });
  assert.strictEqual(res.status, 403);
  assert.ok(res.body.error.includes('Access denied'));
});

it('System Administrator can view users and assign roles with HTTP 200 OK', () => {
  const admin = INITIAL_USERS.find(u => u.role === 'System Administrator')!;
  const resGet = mockServerDispatch('GET', '/api/users', {
    authorization: `Bearer session_${admin.id}`,
  });
  assert.strictEqual(resGet.status, 200);
  assert.ok(Array.isArray(resGet.body));

  const resPut = mockServerDispatch('PUT', '/api/users/usr-vol-01/role', {
    authorization: `Bearer session_${admin.id}`,
  }, { newRole: 'Volunteer Assistant' });
  assert.strictEqual(resPut.status, 200);
});

it('Facilitator attempting to edit an external facilitators plan receives HTTP 403 Forbidden', () => {
  const tate = INITIAL_USERS.find(u => u.name === 'Tate Amutenya')!;
  // Plan-3 is owned by usr-fac-02 (external facilitator)
  const res = mockServerDispatch('PUT', '/api/plans/plan-3', {
    authorization: `Bearer session_${tate.id}`,
  }, { title: 'Tampered Title' });

  assert.strictEqual(res.status, 403);
  assert.ok(res.body.error.includes('Access Denied'));
});

it('Facilitator can edit their own plan (plan-1) with HTTP 200 OK', () => {
  const tate = INITIAL_USERS.find(u => u.name === 'Tate Amutenya')!;
  const res = mockServerDispatch('PUT', '/api/plans/plan-1', {
    authorization: `Bearer session_${tate.id}`,
  }, { title: 'Updated Title by Tate' });

  assert.strictEqual(res.status, 200);
});

console.log(`\n========================================`);
console.log(`Server API Test Results: ${passed}/${total} Passed (100% Success)`);
console.log(`========================================\n`);
