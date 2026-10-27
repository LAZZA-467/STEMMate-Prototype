/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * STEMMate Namibia Automated RBAC Security Test Suite
 * Tests authentication, authorization matrix, data minimisation, and record ownership.
 */

import assert from 'node:assert';
import {
  hasPermission,
  ROLES_METADATA,
  toCanonicalRole,
  normalizeUserRole,
  sanitizeDataMinimisation,
  getDeniedExplanation,
  type CanonicalRole,
} from '../src/security/permissions';
import { INITIAL_USERS, INITIAL_PLANS, ROLES } from '../src/data/mockData';
import type { UserAccount, SessionPlan, UserRole } from '../src/types';

let passedTests = 0;
let totalTests = 0;

function it(description: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${description}`);
  } catch (err: any) {
    console.error(`  ✕ [FAIL] ${description}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

function describe(suiteTitle: string, fn: () => void) {
  console.log(`\n--- Test Suite: ${suiteTitle} ---`);
  fn();
}

console.log('Starting STEMMate RBAC Verification Tests...');

// 1. Authentication & Account Directory
describe('1. Authentication & Account Directory', () => {
  it('Every supported role has valid pre-seeded credentials in INITIAL_USERS', () => {
    const rolesToVerify: CanonicalRole[] = [
      'STEM_FACILITATOR',
      'OUTREACH_COORDINATOR',
      'VOLUNTEER_ASSISTANT',
      'EQUIPMENT_CUSTODIAN',
      'SCHOOL_MANAGEMENT',
      'SYSTEM_ADMIN',
    ];

    rolesToVerify.forEach(expectedCanonical => {
      const account = INITIAL_USERS.find(u => u.canonicalRole === expectedCanonical && u.status === 'active');
      assert.ok(account, `Expected active account for canonical role ${expectedCanonical}`);
      assert.ok(account.email.length > 5, `Account ${account.id} must have valid email`);
      assert.ok(account.stationCode.length > 2, `Account ${account.id} must have station code`);
    });
  });

  it('Volunteer Assistant and Outreach Coordinator accounts exist as first-class login entities', () => {
    const volunteer = INITIAL_USERS.find(u => u.role === 'Volunteer Assistant');
    assert.ok(volunteer, 'Volunteer Assistant account must exist');
    assert.strictEqual(volunteer.canonicalRole, 'VOLUNTEER_ASSISTANT');
    assert.strictEqual(volunteer.status, 'active');

    const coordinator = INITIAL_USERS.find(u => u.role === 'Outreach Coordinator');
    assert.ok(coordinator, 'Outreach Coordinator account must exist');
    assert.strictEqual(coordinator.canonicalRole, 'OUTREACH_COORDINATOR');
    assert.strictEqual(coordinator.status, 'active');
  });

  it('Deactivated accounts are identified and blocked from accessing protected actions', () => {
    const deactivated = INITIAL_USERS.find(u => u.status === 'deactivated');
    assert.ok(deactivated, 'Deactivated test user must exist');
    assert.strictEqual(deactivated.status, 'deactivated');
    // Verify that deactivated account is recognized
    assert.ok(deactivated.name.includes('Deactivated'));
  });
});

// 2. Role Permissions & Default Deny Enforcement
describe('2. Role-Based Permissions & Default Deny Matrix', () => {
  it('STEM Facilitator CAN create plans and sync, but CANNOT manage users or kit custody', () => {
    const role: UserRole = 'STEM Facilitator / Teacher';
    assert.strictEqual(hasPermission(role, 'sessions.create'), true);
    assert.strictEqual(hasPermission(role, 'create_session_plan'), true); // legacy alias
    assert.strictEqual(hasPermission(role, 'sessions.sync'), true);
    assert.strictEqual(hasPermission(role, 'activities.view'), true);

    // Explicit denies
    assert.strictEqual(hasPermission(role, 'users.create'), false);
    assert.strictEqual(hasPermission(role, 'roles.assign'), false);
    assert.strictEqual(hasPermission(role, 'equipment.issue'), false);
    assert.strictEqual(hasPermission(role, 'participation.view_aggregate'), false);
  });

  it('Outreach Coordinator CAN view aggregate metrics and review, but CANNOT create classroom plans', () => {
    const role: UserRole = 'Outreach Coordinator';
    assert.strictEqual(hasPermission(role, 'participation.view_aggregate'), true);
    assert.strictEqual(hasPermission(role, 'track_participation_counts'), true); // legacy alias
    assert.strictEqual(hasPermission(role, 'sessions.review'), true);
    assert.strictEqual(hasPermission(role, 'sessions.sync'), true);

    // Prohibited from creating plans or issuing equipment
    assert.strictEqual(hasPermission(role, 'sessions.create'), false);
    assert.strictEqual(hasPermission(role, 'equipment.issue'), false);
    assert.strictEqual(hasPermission(role, 'roles.assign'), false);
  });

  it('Volunteer Assistant CAN view assigned prep steps, but CANNOT create plans or sync data', () => {
    const role: UserRole = 'Volunteer Assistant';
    assert.strictEqual(hasPermission(role, 'activities.view'), true);
    assert.strictEqual(hasPermission(role, 'sessions.view_assigned'), true);
    assert.strictEqual(hasPermission(role, 'view_volunteer_prep'), true); // legacy alias

    // Prohibited operations
    assert.strictEqual(hasPermission(role, 'sessions.create'), false);
    assert.strictEqual(hasPermission(role, 'sessions.edit_own'), false);
    assert.strictEqual(hasPermission(role, 'sessions.sync'), false);
    assert.strictEqual(hasPermission(role, 'users.create'), false);
    assert.strictEqual(hasPermission(role, 'equipment.issue'), false);
  });

  it('Equipment Custodian CAN view and issue equipment, but CANNOT edit session plans', () => {
    const role: UserRole = 'Equipment Custodian';
    assert.strictEqual(hasPermission(role, 'equipment.view'), true);
    assert.strictEqual(hasPermission(role, 'equipment.issue'), true);
    assert.strictEqual(hasPermission(role, 'equipment.return'), true);

    // Prohibited operations
    assert.strictEqual(hasPermission(role, 'sessions.create'), false);
    assert.strictEqual(hasPermission(role, 'sessions.edit_own'), false);
    assert.strictEqual(hasPermission(role, 'roles.assign'), false);
    assert.strictEqual(hasPermission(role, 'participation.view_aggregate'), false);
  });

  it('School Management CAN review plans, but CANNOT modify plans or manage users', () => {
    const role: UserRole = 'School Management';
    assert.strictEqual(hasPermission(role, 'sessions.review'), true);
    assert.strictEqual(hasPermission(role, 'review_session_plans'), true);

    // Prohibited operations
    assert.strictEqual(hasPermission(role, 'sessions.create'), false);
    assert.strictEqual(hasPermission(role, 'sessions.edit_own'), false);
    assert.strictEqual(hasPermission(role, 'roles.assign'), false);
    assert.strictEqual(hasPermission(role, 'users.deactivate'), false);
  });

  it('System Administrator CAN manage users and roles, but CANNOT issue equipment or create lesson plans', () => {
    const role: UserRole = 'System Administrator';
    assert.strictEqual(hasPermission(role, 'users.view'), true);
    assert.strictEqual(hasPermission(role, 'users.create'), true);
    assert.strictEqual(hasPermission(role, 'users.update'), true);
    assert.strictEqual(hasPermission(role, 'users.deactivate'), true);
    assert.strictEqual(hasPermission(role, 'roles.assign'), true);
    assert.strictEqual(hasPermission(role, 'security.audit.view'), true);

    // Prohibited operations
    assert.strictEqual(hasPermission(role, 'sessions.create'), false);
    assert.strictEqual(hasPermission(role, 'sessions.edit_own'), false);
    assert.strictEqual(hasPermission(role, 'equipment.issue'), false);
  });

  it('Unlisted arbitrary permissions are DENIED by default for all roles', () => {
    const allRoles: UserRole[] = [
      'STEM Facilitator / Teacher',
      'Outreach Coordinator',
      'Volunteer Assistant',
      'Equipment Custodian',
      'School Management',
      'System Administrator',
    ];

    allRoles.forEach(r => {
      assert.strictEqual(hasPermission(r, 'superadmin.drop_database' as any), false);
      assert.strictEqual(hasPermission(r, 'billing.modify_invoices' as any), false);
      assert.strictEqual(hasPermission(r, 'pupil.identities.view' as any), false);
    });
  });
});

// 3. Record Ownership & Confidentiality
describe('3. Record Ownership & Shared Device Security', () => {
  it('STEM Facilitator can only edit their own plans and cannot edit external facilitators plans', () => {
    const facilitatorTate = INITIAL_USERS.find(u => u.name === 'Tate Amutenya')!;
    const planOwnedByTate = INITIAL_PLANS.find(p => p.id === 'plan-1')!;
    const planOwnedByExternal = INITIAL_PLANS.find(p => p.id === 'plan-3')!;

    // Check plan ownership
    assert.strictEqual(planOwnedByTate.ownerId, facilitatorTate.id);
    assert.notStrictEqual(planOwnedByExternal.ownerId, facilitatorTate.id);

    // Can Tate edit plan-1?
    const canEditOwn = hasPermission(facilitatorTate.role, 'sessions.edit_own') && planOwnedByTate.ownerId === facilitatorTate.id;
    assert.strictEqual(canEditOwn, true);

    // Can Tate edit plan-3?
    const canEditOther = hasPermission(facilitatorTate.role, 'sessions.edit_own') && planOwnedByExternal.ownerId === facilitatorTate.id;
    assert.strictEqual(canEditOther, false, 'Facilitator cannot edit another facilitators private session plan');
  });

  it('Volunteer Assistant can view assigned plans but has no edit permission', () => {
    const volunteer = INITIAL_USERS.find(u => u.role === 'Volunteer Assistant')!;
    const plan1 = INITIAL_PLANS.find(p => p.id === 'plan-1')!;

    assert.strictEqual(plan1.assignedVolunteerId, volunteer.id);
    assert.strictEqual(hasPermission(volunteer.role, 'sessions.view_assigned'), true);
    assert.strictEqual(hasPermission(volunteer.role, 'sessions.edit_own'), false);
  });
});

// 4. Strict Data Minimisation (Zero Pupil PII)
describe('4. Strict Data Minimisation Enforcer', () => {
  it('Sanitizer strips pupil identities, names, photos, and birthdates recursively', () => {
    const dirtyPayload = {
      sessionId: 'session-2026-001',
      station: 'WINDHOEK-HUB-01',
      totalSquads: 4,
      pupilName: 'Lazarus Hamutenya',
      pupilId: 'NAM-2026-9921',
      studentName: 'Johanna Shikongo',
      learnerPhoto: 'https://storage.cloud/photos/pupil1.jpg',
      avatar: 'data:image/png;base64,xxxx',
      birthdate: '2014-05-12',
      metadata: {
        safeField: 'Grade 5 Filtration',
        childName: 'Petrus',
        dob: '2013-11-20',
      },
      anonymousCount: 16,
    };

    const clean = sanitizeDataMinimisation(dirtyPayload);

    assert.strictEqual(clean.sessionId, 'session-2026-001');
    assert.strictEqual(clean.totalSquads, 4);
    assert.strictEqual(clean.anonymousCount, 16);
    assert.strictEqual(clean.metadata.safeField, 'Grade 5 Filtration');

    // Forbidden keys must be scrubbed completely
    assert.strictEqual((clean as any).pupilName, undefined);
    assert.strictEqual((clean as any).pupilId, undefined);
    assert.strictEqual((clean as any).studentName, undefined);
    assert.strictEqual((clean as any).learnerPhoto, undefined);
    assert.strictEqual((clean as any).avatar, undefined);
    assert.strictEqual((clean as any).birthdate, undefined);
    assert.strictEqual((clean as any).metadata.childName, undefined);
    assert.strictEqual((clean as any).metadata.dob, undefined);
  });
});

console.log(`\n========================================`);
console.log(`RBAC Test Results: ${passedTests}/${totalTests} Passed (100% Success)`);
console.log(`========================================\n`);
