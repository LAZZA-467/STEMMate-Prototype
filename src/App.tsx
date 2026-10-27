/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { TopAppBar, BottomTabBar } from './components/Navigation';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { ActivityDetailScreen } from './screens/ActivityDetailScreen';
import { CreatePlanFilterScreen } from './screens/CreatePlanFilterScreen';
import { CreatePlanResultsScreen } from './screens/CreatePlanResultsScreen';
import { CreatePlanFormScreen } from './screens/CreatePlanFormScreen';
import { MyPlansScreen } from './screens/MyPlansScreen';
import { LessonRunnerScreen } from './screens/LessonRunnerScreen';
import { KitScreen } from './screens/KitScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StorageErrorScreen } from './screens/StorageErrorScreen';
import { PlanPreviewModal } from './components/PlanPreviewModal';
import { SaveSuccessModal } from './components/SaveSuccessModal';
import { ConflictModal } from './components/ConflictModal';
import { RouteGuard } from './components/RouteGuard';
import { OutreachScreen } from './screens/OutreachScreen';
import { VolunteerPrepScreen } from './screens/VolunteerPrepScreen';
import { ManagementReviewScreen } from './screens/ManagementReviewScreen';
import { AdminUsersScreen } from './screens/AdminUsersScreen';

const AppContent: React.FC = () => {
  const { activeScreen, activeTab, role, roleMetadata } = useApp();

  const isTabScreen = [
    'home',
    'explore',
    'my-plans',
    'kit',
    'settings',
    'outreach',
    'volunteer-prep',
    'plan-review',
    'admin-users',
  ].includes(activeScreen);

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'home':
        return 'STEMMATE Namibia';
      case 'explore':
        return 'STEM Library';
      case 'my-plans':
        return 'My Plans';
      case 'kit':
        return 'Kit Inventory';
      case 'outreach':
        return 'Outreach Metrics';
      case 'volunteer-prep':
        return 'Volunteer Prep Guide';
      case 'plan-review':
        return 'Management Review';
      case 'admin-users':
        return 'User & Access Control';
      case 'settings':
        return 'Settings & RBAC';
      default:
        return 'STEMMATE';
    }
  };

  const getScreenSubtitle = () => {
    switch (activeScreen) {
      case 'home':
        return `${roleMetadata.shortLabel} · Field Station 04`;
      case 'kit':
        return `${roleMetadata.shortLabel} View`;
      case 'outreach':
        return 'Zero Pupil PII · Aggregates Only';
      case 'volunteer-prep':
        return 'Before Learners Arrive';
      case 'plan-review':
        return 'Curriculum Sign-Off';
      case 'admin-users':
        return 'System Administrator Control';
      default:
        return undefined;
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <LoginScreen />;
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'activity-detail':
        return <ActivityDetailScreen />;
      case 'plan-filter':
        return (
          <RouteGuard requiredPermission="create_session_plan">
            <CreatePlanFilterScreen />
          </RouteGuard>
        );
      case 'plan-filter-results':
        return (
          <RouteGuard requiredPermission="create_session_plan">
            <CreatePlanResultsScreen />
          </RouteGuard>
        );
      case 'plan-form':
        return (
          <RouteGuard requiredPermission="create_session_plan">
            <CreatePlanFormScreen />
          </RouteGuard>
        );
      case 'my-plans':
        return <MyPlansScreen />;
      case 'plan-runner':
        return <LessonRunnerScreen />;
      case 'kit':
        return <KitScreen />;
      case 'outreach':
        return (
          <RouteGuard requiredPermission="track_participation_counts">
            <OutreachScreen />
          </RouteGuard>
        );
      case 'volunteer-prep':
        return (
          <RouteGuard requiredPermission="view_volunteer_prep">
            <VolunteerPrepScreen />
          </RouteGuard>
        );
      case 'plan-review':
        return (
          <RouteGuard requiredPermission="review_session_plans">
            <ManagementReviewScreen />
          </RouteGuard>
        );
      case 'admin-users':
        return (
          <RouteGuard requiredPermission="users.view">
            <AdminUsersScreen />
          </RouteGuard>
        );
      case 'settings':
        return <SettingsScreen />;
      case 'storage-error':
        return <StorageErrorScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <MobileFrame>
      {/* Top App Bar for root tab screens */}
      {isTabScreen && (
        <TopAppBar title={getScreenTitle()} subtitle={getScreenSubtitle()} />
      )}

      {/* Screen Viewport */}
      {renderActiveScreen()}

      {/* Bottom Navigation Tab Bar for root screens */}
      {isTabScreen && <BottomTabBar />}

      {/* Modals & Overlays */}
      <PlanPreviewModal />
      <SaveSuccessModal />
      <ConflictModal />
    </MobileFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
