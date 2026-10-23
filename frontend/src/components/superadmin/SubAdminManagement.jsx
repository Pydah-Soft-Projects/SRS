import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import SkeletonLoader from '../SkeletonLoader';
import ToastNotificationContainer from '../ToastNotificationContainer';

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────
const Container = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0 2rem 0;
`;

// Top Header
const HeaderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.25rem 2rem;
  border: 1px solid #e0f2fe;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0ea5e9, #38bdf8);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderIconBox = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25);
  flex-shrink: 0;
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Title = styled.h2`
  color: #0284c7;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.88rem;
  font-weight: 500;
`;

const HeaderStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: ${({ $variant }) => ($variant === 'active' ? '#ecfdf5' : '#f0f9ff')};
  border: 1px solid ${({ $variant }) => ($variant === 'active' ? '#a7f3d0' : '#bae6fd')};
  min-width: 75px;

  .stat-value {
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1.1;
    color: ${({ $variant }) => ($variant === 'active' ? '#059669' : '#0284c7')};
  }

  .stat-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: ${({ $variant }) => ($variant === 'active' ? '#047857' : '#0369a1')};
    text-transform: uppercase;
  }
`;

// Navigation Tabs
const TabNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1.5px solid ${({ $active }) => ($active ? '#0284c7' : '#e0f2fe')};
  background: ${({ $active, $color }) =>
    $active
      ? $color || 'linear-gradient(135deg, #0284c7, #0ea5e9)'
      : 'white'};
  color: ${({ $active }) => ($active ? 'white' : '#475569')};
  box-shadow: ${({ $active }) => ($active ? '0 4px 14px rgba(14, 165, 233, 0.25)' : 'none')};

  &:hover {
    transform: translateY(-1px);
    border-color: #0ea5e9;
    color: ${({ $active }) => ($active ? 'white' : '#0284c7')};
    background: ${({ $active }) => ($active ? 'linear-gradient(135deg, #0284c7, #0ea5e9)' : '#f0f9ff')};
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

// 3-Step Progress Bar
const StepBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StepItem = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  border: 1.5px solid ${({ $active, $color }) => ($active ? $color || '#0284c7' : '#e0f2fe')};
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.04);
  transition: all 0.2s ease;
`;

const StepCircle = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${({ $color }) => $color || 'linear-gradient(135deg, #0284c7, #0ea5e9)'};
  color: white;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.2);
`;

const StepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  .step-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #0f172a;
  }

  .step-subtitle {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 500;
  }
`;

// 3-Column Layout
const ThreeColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ColumnCard = styled.div`
  background: white;
  border-radius: 18px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ColumnHeader = styled.div`
  background: ${({ $gradient }) => $gradient || 'linear-gradient(135deg, #0284c7, #0ea5e9)'};
  color: white;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  .col-title {
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
  }
`;

const ColumnBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 650px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #bae6fd;
    border-radius: 3px;
  }
`;

// Form Inputs
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .required {
    color: #ef4444;
    margin-left: 2px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.875rem;
  border: 1.5px solid #e0f2fe;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #f8fafc;

  &:focus {
    border-color: #0ea5e9;
    background: white;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.65rem 0.875rem;
  border: 1.5px solid #e0f2fe;
  border-radius: 10px;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  background: #f8fafc;
  box-sizing: border-box;

  &:focus {
    border-color: #0ea5e9;
    background: white;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
  }
`;

// Role Cards (Column 2)
const RoleCardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RoleOptionCard = styled.div`
  border: 1.5px solid ${({ $selected, $color }) => ($selected ? $color || '#0284c7' : '#e0f2fe')};
  background: ${({ $selected, $bgColor }) => ($selected ? $bgColor || '#f0f9ff' : 'white')};
  border-radius: 12px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  &:hover {
    border-color: ${({ $color }) => $color || '#0ea5e9'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.08);
  }
`;

const RoleIconSquircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color || '#0284c7'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
`;

const RoleInfo = styled.div`
  flex: 1;
  min-width: 0;

  .role-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.2rem;
  }

  .role-desc {
    font-size: 0.76rem;
    color: #64748b;
    line-height: 1.35;
    margin: 0;
  }
`;

// Access Scope Permissions (Column 3)
const PermissionRowCard = styled.div`
  border: 1.5px solid ${({ $enabled }) => ($enabled ? '#0284c7' : '#e0f2fe')};
  background: ${({ $enabled }) => ($enabled ? '#f0f9ff' : 'white')};
  border-radius: 12px;
  padding: 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.18s ease;
`;

const PermissionRowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  .perm-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #0f172a;
  }
`;

const AccessSegmentedGroup = styled.div`
  display: flex;
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
`;

const SegmentButton = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active, $type }) => {
    if (!$active) return 'transparent';
    if ($type === 'full') return '#0284c7';
    if ($type === 'view') return '#0ea5e9';
    return '#94a3b8';
  }};
  color: ${({ $active }) => ($active ? 'white' : '#64748b')};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: ${({ $active }) => ($active ? 'white' : '#0369a1')};
  }
`;

// Bottom Sticky Action Bar
const BottomActionBar = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.06);
`;

const PrimaryBtn = styled.button`
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryBtn = styled.button`
  background: #f0f9ff;
  border: 1.5px solid #bae6fd;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.92rem;
  color: #0284c7;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: #e0f2fe;
    border-color: #7dd3fc;
    color: #0369a1;
  }
`;

// All Users Table View
const TableWrapper = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.06);
  overflow: hidden;
`;

const TableToolbar = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e0f2fe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 320px;
  max-width: 100%;

  input {
    width: 100%;
    padding: 0.65rem 0.875rem 0.65rem 2.25rem;
    border: 1.5px solid #e0f2fe;
    border-radius: 10px;
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;

    &:focus {
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12);
    }
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #0284c7;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #f0f9ff;
  padding: 1rem 1.25rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.8rem;
  color: #0369a1;
  border-bottom: 2px solid #bae6fd;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f9ff;
  color: #334155;
  font-size: 0.88rem;
  vertical-align: middle;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.78rem;
  background: ${({ $active }) => ($active ? '#ecfdf5' : '#fee2e2')};
  color: ${({ $active }) => ($active ? '#047857' : '#b91c1c')};
  border: 1px solid ${({ $active }) => ($active ? '#a7f3d0' : '#fecaca')};
`;

const ActionBtn = styled.button`
  border: 1px solid ${({ $variant }) => ($variant === 'danger' ? '#fecaca' : '#bae6fd')};
  background: ${({ $variant }) => ($variant === 'danger' ? '#fef2f2' : '#f0f9ff')};
  color: ${({ $variant }) => ($variant === 'danger' ? '#dc2626' : '#0284c7')};
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $variant }) => ($variant === 'danger' ? '#fee2e2' : '#e0f2fe')};
    transform: translateY(-1px);
  }
`;

// Role Configuration Grid (Tab 3)
const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const RoleConfigCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1.5px solid #e0f2fe;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.05);
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $color }) => $color || '#0ea5e9'};
    box-shadow: 0 8px 24px rgba(14, 165, 233, 0.12);
    transform: translateY(-2px);
  }
`;

// Modals
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
`;

const PriorityModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 3000 !important;
`;

// ─── ROLE PRESETS ─────────────────────────────────────────────────────────────
const ROLE_PRESETS = [
  {
    id: 'recruitment_head',
    name: 'Recruitment Administrator',
    badge: 'Full Access',
    icon: '🛡️',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    description: 'Full administrative access across recruitment forms, candidate evaluations, assessments, and interview panels.',
    permissionCount: 6,
    defaultPermissions: {
      'forms.manage': 'full_access',
      'candidates.manage': 'full_access',
      'tests.manage': 'full_access',
      'interviews.manage': 'full_access',
      'users.manage': 'full_access',
      'panel_members.manage': 'full_access'
    },
    hasPanelMemberAccess: true
  },
  {
    id: 'candidate_evaluator',
    name: 'Candidate Evaluation Lead',
    badge: 'Hiring Lead',
    icon: '👥',
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
    description: 'Evaluates applicant profiles, reviews credentials, manages candidate shortlisting and hiring decisions.',
    permissionCount: 4,
    defaultPermissions: {
      'candidates.manage': 'full_access',
      'forms.manage': 'view_only',
      'interviews.manage': 'view_only',
      'tests.manage': 'view_only'
    },
    hasPanelMemberAccess: false
  },
  {
    id: 'assessment_manager',
    name: 'Assessment & Test Manager',
    badge: 'Assessments',
    icon: '📝',
    color: '#059669',
    bgColor: '#f0fdf4',
    description: 'Manages assessment tests, question banks, typing tests, candidate assignments, and publishes scores.',
    permissionCount: 2,
    defaultPermissions: {
      'tests.manage': 'full_access',
      'candidates.manage': 'view_only'
    },
    hasPanelMemberAccess: false
  },
  {
    id: 'interview_coordinator',
    name: 'Interview Panel Coordinator',
    badge: 'Interviews',
    icon: '🎯',
    color: '#d97706',
    bgColor: '#fffbeb',
    description: 'Schedules interview rounds, assigns panel members, collects score sheets, and manages candidate feedback.',
    permissionCount: 3,
    defaultPermissions: {
      'interviews.manage': 'full_access',
      'panel_members.manage': 'full_access',
      'candidates.manage': 'view_only'
    },
    hasPanelMemberAccess: true
  },
  {
    id: 'form_workflow_admin',
    name: 'Forms & Workflow Specialist',
    badge: 'Workflows',
    icon: '📋',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    description: 'Designs dynamic recruitment application forms, configures form schemas, and monitors incoming submissions.',
    permissionCount: 2,
    defaultPermissions: {
      'forms.manage': 'full_access',
      'candidates.manage': 'view_only'
    },
    hasPanelMemberAccess: false
  },
  {
    id: 'department_reviewer',
    name: 'Department Reviewer / Auditor',
    badge: 'View Only',
    icon: '👁️',
    color: '#475569',
    bgColor: '#f8fafc',
    description: 'Read-only administrative visibility across all candidates, tests, and interview processes for auditing.',
    permissionCount: 5,
    defaultPermissions: {
      'forms.manage': 'view_only',
      'candidates.manage': 'view_only',
      'tests.manage': 'view_only',
      'interviews.manage': 'view_only',
      'panel_members.manage': 'view_only'
    },
    hasPanelMemberAccess: false
  },
  {
    id: 'custom_role',
    name: 'Custom Role',
    badge: 'Custom',
    icon: '⚙️',
    color: '#0891b2',
    bgColor: '#ecfeff',
    description: 'Customized permission scope configured directly using the granular module toggles in Access Scope.',
    permissionCount: 0,
    defaultPermissions: {},
    hasPanelMemberAccess: false
  }
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fetchingHrmsId, setFetchingHrmsId] = useState(false);
  const [showSubAdminPassword, setShowSubAdminPassword] = useState(false);

  // Active view tab: 'create' | 'users' | 'roles'
  const [activeTab, setActiveTab] = useState('create');
  const [selectedRoleId, setSelectedRoleId] = useState('recruitment_head');
  const [searchFilter, setSearchFilter] = useState('');

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    password: '',
    campus: '',
    courses: [],
    permissions: ROLE_PRESETS[0].defaultPermissions,
    hasPanelMemberAccess: ROLE_PRESETS[0].hasPanelMemberAccess
  });

  // HRMS Search Modal
  const [showHrmsModal, setShowHrmsModal] = useState(false);
  const [hrmsQuery, setHrmsQuery] = useState('');
  const [hrmsResults, setHrmsResults] = useState([]);
  const [hrmsSearching, setHrmsSearching] = useState(false);
  const [hrmsError, setHrmsError] = useState('');
  const hrmsSearchTimer = React.useRef(null);

  // Permissions View Modal
  const [viewingPermissions, setViewingPermissions] = useState(null);

  // Role Presets State (Editable & Deletable with local persistence)
  const [rolePresets, setRolePresets] = useState(() => {
    try {
      const saved = localStorage.getItem('srs_role_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return ROLE_PRESETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('srs_role_presets', JSON.stringify(rolePresets));
    } catch (e) {
      // ignore
    }
  }, [rolePresets]);

  // Edit / Create Role Configuration Profile Modal
  const [showRoleConfigModal, setShowRoleConfigModal] = useState(false);
  const [roleConfigIsNew, setRoleConfigIsNew] = useState(false);
  const [roleConfigForm, setRoleConfigForm] = useState({
    id: '',
    name: '',
    badge: 'Custom',
    icon: '🛡️',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    description: '',
    defaultPermissions: {},
    hasPanelMemberAccess: false
  });

  const handleOpenEditRole = (preset) => {
    setRoleConfigIsNew(false);
    setRoleConfigForm({
      id: preset.id,
      name: preset.name || '',
      badge: preset.badge || 'Configured',
      icon: preset.icon || '🛡️',
      color: preset.color || '#0284c7',
      bgColor: preset.bgColor || '#f0f9ff',
      description: preset.description || '',
      defaultPermissions: { ...(preset.defaultPermissions || {}) },
      hasPanelMemberAccess: Boolean(preset.hasPanelMemberAccess)
    });
    setShowRoleConfigModal(true);
  };

  const handleOpenNewRole = () => {
    setRoleConfigIsNew(true);
    setRoleConfigForm({
      id: `role_${Date.now()}`,
      name: '',
      badge: 'Custom',
      icon: '🛡️',
      color: '#0284c7',
      bgColor: '#f0f9ff',
      description: '',
      defaultPermissions: {
        'forms.manage': 'view_only',
        'candidates.manage': 'view_only'
      },
      hasPanelMemberAccess: false
    });
    setShowRoleConfigModal(true);
  };

  const handleDeleteRole = (preset) => {
    if (rolePresets.length <= 1) {
      setToast({ type: 'danger', message: 'You must maintain at least one role profile.' });
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the "${preset.name}" role profile?`)) {
      return;
    }
    setRolePresets((prev) => prev.filter((r) => r.id !== preset.id));
    setToast({ type: 'success', message: `✓ Role "${preset.name}" deleted successfully.` });
  };

  const handleSaveRoleConfig = (e) => {
    e.preventDefault();
    if (!roleConfigForm.name.trim()) {
      setToast({ type: 'danger', message: 'Please provide a role name.' });
      return;
    }

    const permissionCount = Object.keys(roleConfigForm.defaultPermissions || {}).filter(
      (k) => roleConfigForm.defaultPermissions[k]
    ).length;

    const updatedRole = {
      ...roleConfigForm,
      name: roleConfigForm.name.trim(),
      permissionCount
    };

    if (roleConfigIsNew) {
      setRolePresets((prev) => [...prev, updatedRole]);
      setToast({ type: 'success', message: `✓ Role "${updatedRole.name}" created successfully.` });
    } else {
      setRolePresets((prev) =>
        prev.map((r) => (r.id === updatedRole.id ? updatedRole : r))
      );
      setToast({ type: 'success', message: `✓ Role "${updatedRole.name}" updated successfully.` });
    }
    setShowRoleConfigModal(false);
  };

  // Role Configuration Create User Modal
  const [showRoleUserModal, setShowRoleUserModal] = useState(false);
  const [roleModalPreset, setRoleModalPreset] = useState(ROLE_PRESETS[0]);
  const [roleModalSaving, setRoleModalSaving] = useState(false);
  const [hrmsTargetForm, setHrmsTargetForm] = useState('main'); // 'main' | 'roleModal'
  const [roleModalCourses, setRoleModalCourses] = useState([]);
  const [roleModalForm, setRoleModalForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    password: '',
    campus: '',
    courses: [],
    permissions: ROLE_PRESETS[0].defaultPermissions,
    hasPanelMemberAccess: ROLE_PRESETS[0].hasPanelMemberAccess
  });

  const openRoleCreateModal = (preset) => {
    const selected = preset || rolePresets[0] || ROLE_PRESETS[0];
    setRoleModalPreset(selected);
    setRoleModalCourses([]);
    setRoleModalForm({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      password: '',
      campus: '',
      courses: [],
      permissions: { ...selected.defaultPermissions },
      hasPanelMemberAccess: Boolean(selected.hasPanelMemberAccess)
    });
    setShowRoleUserModal(true);
  };

  const fetchCoursesForRoleModal = async (campus) => {
    if (!campus) {
      setRoleModalCourses([]);
      return;
    }
    try {
      const response = await api.get(`/courses/campus/${campus}`);
      setRoleModalCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setRoleModalCourses([]);
    }
  };

  const handleRoleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      setRoleModalSaving(true);
      const payload = {
        name: roleModalForm.name,
        employeeId: roleModalForm.employeeId ? roleModalForm.employeeId.trim() : undefined,
        email: roleModalForm.email,
        campus: roleModalForm.campus || null,
        courses: roleModalForm.courses && roleModalForm.courses.length > 0 ? roleModalForm.courses : undefined,
        permissions: roleModalForm.permissions,
        hasPanelMemberAccess: roleModalForm.hasPanelMemberAccess,
        profile: roleModalForm.phone ? { phone: roleModalForm.phone } : undefined
      };

      if (roleModalForm.password && roleModalForm.password.trim()) {
        payload.password = roleModalForm.password.trim();
      }

      await api.post('/auth/sub-admins', payload);
      await fetchSubAdmins();
      setShowRoleUserModal(false);
      setToast({
        type: 'success',
        message: `✓ User created successfully with "${roleModalPreset.name}" role!`
      });
    } catch (error) {
      console.error('Failed to create user from role modal', error);
      setToast({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to create user'
      });
    } finally {
      setRoleModalSaving(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
    fetchCampuses();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/sub-admins');
      setSubAdmins(data.subAdmins || []);
      setAvailablePermissions(data.availablePermissions || []);
    } catch (error) {
      console.error('Failed to fetch sub admins', error);
      setToast({ type: 'danger', message: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await api.get('/courses/campuses/list');
      setCampuses(response.data.campuses || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
    }
  };

  const fetchCoursesForCampus = async (campus) => {
    if (!campus) {
      setCourses([]);
      return;
    }
    try {
      const response = await api.get(`/courses/campus/${campus}`);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const resetForm = () => {
    setFormState({
      name: '',
      employeeId: '',
      email: '',
      phone: '',
      password: '',
      campus: '',
      courses: [],
      permissions: ROLE_PRESETS[0].defaultPermissions,
      hasPanelMemberAccess: ROLE_PRESETS[0].hasPanelMemberAccess
    });
    setEditingSubAdmin(null);
    setSelectedRoleId('recruitment_head');
    setCourses([]);
  };

  const handleSelectRolePreset = (preset) => {
    setSelectedRoleId(preset.id);
    if (preset.id !== 'custom_role') {
      setFormState((prev) => ({
        ...prev,
        permissions: { ...preset.defaultPermissions },
        hasPanelMemberAccess: preset.hasPanelMemberAccess
      }));
    }
  };

  const handlePermissionAccessChange = (permKey, level) => {
    setFormState((prev) => {
      const updated = { ...(prev.permissions || {}) };
      if (!level) {
        delete updated[permKey];
      } else {
        updated[permKey] = level;
      }
      return { ...prev, permissions: updated };
    });
    setSelectedRoleId('custom_role');
  };

  // HRMS Employee Selection
  const selectHrmsEmployee = (emp) => {
    const fallbackEmail = emp.email || (emp.emp_no ? `${emp.emp_no}@pydahsoft.in` : '');
    if (hrmsTargetForm === 'roleModal') {
      setRoleModalForm((prev) => ({
        ...prev,
        name: emp.employee_name || prev.name,
        employeeId: emp.emp_no || prev.employeeId,
        email: fallbackEmail || prev.email,
        phone: emp.phone_number || prev.phone,
        password: ''
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        name: emp.employee_name || prev.name,
        employeeId: emp.emp_no || prev.employeeId,
        email: fallbackEmail || prev.email,
        phone: emp.phone_number || prev.phone,
        password: ''
      }));
    }
    setShowHrmsModal(false);
    setToast({
      type: 'success',
      message: `✓ Linked ${emp.employee_name} (${emp.emp_no}) from HRMS`
    });
  };

  const fetchByEmployeeId = async (empNo, target = 'main') => {
    if (!empNo || !empNo.trim()) return;
    try {
      setFetchingHrmsId(true);
      const { data } = await api.get(`/auth/hrms/search-employees?q=${encodeURIComponent(empNo.trim())}`);
      const matches = data.employees || [];
      const exact = matches.find((e) => String(e.emp_no).trim() === String(empNo).trim()) || matches[0];
      if (exact) {
        setHrmsTargetForm(target);
        selectHrmsEmployee(exact);
      } else {
        setToast({ type: 'danger', message: `No HRMS employee found with ID "${empNo}"` });
      }
    } catch (err) {
      setToast({ type: 'danger', message: 'Failed to search HRMS for employee ID' });
    } finally {
      setFetchingHrmsId(false);
    }
  };

  const handleHrmsQueryChange = (e) => {
    const val = e.target.value;
    setHrmsQuery(val);
    setHrmsError('');
    if (hrmsSearchTimer.current) clearTimeout(hrmsSearchTimer.current);

    if (val.trim().length < 2) {
      setHrmsResults([]);
      return;
    }

    hrmsSearchTimer.current = setTimeout(async () => {
      try {
        setHrmsSearching(true);
        const { data } = await api.get(`/auth/hrms/search-employees?q=${encodeURIComponent(val.trim())}`);
        setHrmsResults(data.employees || []);
        if ((data.employees || []).length === 0) {
          setHrmsError('No employees found matching your search.');
        }
      } catch (err) {
        setHrmsError(err.response?.data?.message || 'Failed to search HRMS employees.');
        setHrmsResults([]);
      } finally {
        setHrmsSearching(false);
      }
    }, 400);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formState.name,
        employeeId: formState.employeeId ? formState.employeeId.trim() : undefined,
        email: formState.email,
        campus: formState.campus || null,
        courses: formState.courses && formState.courses.length > 0 ? formState.courses : undefined,
        permissions: formState.permissions,
        hasPanelMemberAccess: formState.hasPanelMemberAccess,
        profile: formState.phone ? { phone: formState.phone } : undefined
      };

      if (!editingSubAdmin) {
        if (formState.password && formState.password.trim()) {
          payload.password = formState.password.trim();
        }
        await api.post('/auth/sub-admins', payload);
      } else {
        if (formState.password && formState.password.trim()) {
          payload.password = formState.password.trim();
        }
        await api.put(`/auth/sub-admins/${editingSubAdmin._id}`, payload);
      }

      await fetchSubAdmins();
      setToast({
        type: 'success',
        message: editingSubAdmin ? 'User updated successfully.' : 'User created successfully.'
      });
      resetForm();
      setActiveTab('users');
    } catch (error) {
      console.error('Failed to save user', error);
      setToast({
        type: 'danger',
        message: error.response?.data?.message || 'Unable to save user'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingSubAdmin(user);
    let perms = {};
    if (Array.isArray(user.permissions)) {
      user.permissions.forEach((k) => (perms[k] = 'full_access'));
    } else if (typeof user.permissions === 'object' && user.permissions !== null) {
      perms = { ...user.permissions };
    }

    setFormState({
      name: user.name || '',
      employeeId: user.employeeId || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      password: '',
      campus: user.campus || '',
      courses: user.courses ? user.courses.map((c) => (typeof c === 'object' ? c._id : c)) : [],
      permissions: perms,
      hasPanelMemberAccess: !!user.hasPanelMemberAccess
    });

    if (user.campus) {
      fetchCoursesForCampus(user.campus);
    }
    setSelectedRoleId('custom_role');
    setActiveTab('create');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/auth/sub-admins/${id}`);
      await fetchSubAdmins();
      setToast({ type: 'success', message: 'User deleted successfully.' });
    } catch (err) {
      setToast({ type: 'danger', message: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      await api.put(`/auth/users/${user._id}/status`, { isActive: !user.isActive });
      await fetchSubAdmins();
      setToast({
        type: 'success',
        message: `User is now ${!user.isActive ? 'active' : 'inactive'}.`
      });
    } catch (err) {
      setToast({ type: 'danger', message: 'Unable to update status' });
    }
  };

  const activeCount = useMemo(() => subAdmins.filter((u) => u.isActive).length, [subAdmins]);

  const filteredUsers = useMemo(() => {
    if (!searchFilter.trim()) return subAdmins;
    const q = searchFilter.toLowerCase().trim();
    return subAdmins.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q))
    );
  }, [subAdmins, searchFilter]);

  return (
    <Container>
      <ToastNotificationContainer toast={toast} onClose={() => setToast({ type: '', message: '' })} />

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <HeaderCard>
        <HeaderLeft>
          <HeaderIconBox>🛡️</HeaderIconBox>
          <HeaderTitleGroup>
            <Title>User Management</Title>
            <Subtitle>Create and manage users with role-based access</Subtitle>
          </HeaderTitleGroup>
        </HeaderLeft>

        <HeaderStats>
          <StatBadge>
            <span className="stat-value">{subAdmins.length}</span>
            <span className="stat-label">Total</span>
          </StatBadge>
          <StatBadge $variant="active">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Active</span>
          </StatBadge>
        </HeaderStats>
      </HeaderCard>

      {/* ─── TAB NAVIGATION ──────────────────────────────────────────────── */}
      <TabNav>
        <TabButton
          $active={activeTab === 'create'}
          onClick={() => {
            if (activeTab !== 'create') {
              resetForm();
            }
            setActiveTab('create');
          }}
        >
          <span>{editingSubAdmin ? '✏️ Edit User' : '👤 + Create User'}</span>
        </TabButton>

        <TabButton $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <span>👥 All Users ({subAdmins.length})</span>
        </TabButton>

        <TabButton
          $active={activeTab === 'roles'}
          onClick={() => setActiveTab('roles')}
        >
          <span>⚙️ Role Configuration</span>
        </TabButton>
      </TabNav>

      {/* ─── TAB 1: CREATE / EDIT USER (3-COLUMN WORKSPACE) ─────────────── */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Step Indicator */}
          <StepBar>
            <StepItem $active={true} $color="#0284c7">
              <StepCircle $color="#0284c7">1</StepCircle>
              <StepText>
                <span className="step-title">User Information</span>
                <span className="step-subtitle">Details & credentials</span>
              </StepText>
            </StepItem>

            <StepItem $active={true} $color="#0ea5e9">
              <StepCircle $color="#0ea5e9">2</StepCircle>
              <StepText>
                <span className="step-title">Role Selection</span>
                <span className="step-subtitle">Choose role template</span>
              </StepText>
            </StepItem>

            <StepItem $active={true} $color="#059669">
              <StepCircle $color="#059669">3</StepCircle>
              <StepText>
                <span className="step-title">Access Scope</span>
                <span className="step-subtitle">Set campus & permissions</span>
              </StepText>
            </StepItem>
          </StepBar>

          {/* 3 Columns */}
          <ThreeColumnLayout>
            {/* ─── COLUMN 1: User Information ─── */}
            <ColumnCard>
              <ColumnHeader $gradient="linear-gradient(135deg, #0284c7, #0ea5e9)">
                <h3 className="col-title">
                  <span>👤</span>
                  <span>User Information</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setHrmsTargetForm('main');
                    setHrmsQuery('');
                    setHrmsResults([]);
                    setHrmsError('');
                    setShowHrmsModal(true);
                  }}
                  style={{
                    background: 'white',
                    color: '#0284c7',
                    border: 'none',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  <span>🔍</span>
                  <span>Import from HRMS</span>
                </button>
              </ColumnHeader>

              <ColumnBody>
                <FormGroup>
                  <Label htmlFor="col1_name">
                    <span>Full Name</span>
                    <span className="required">*</span>
                  </Label>
                  <Input
                    id="col1_name"
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="col1_email">
                    <span>Email Address</span>
                    <span className="required">*</span>
                  </Label>
                  <Input
                    id="col1_email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </FormGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <FormGroup>
                    <Label htmlFor="col1_username">
                      <span>Employee ID (HRMS)</span>
                      {formState.employeeId && (
                        <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 800 }}>ID</span>
                      )}
                    </Label>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Input
                        id="col1_username"
                        type="text"
                        placeholder="e.g. 2145"
                        value={formState.employeeId}
                        onChange={(e) => setFormState({ ...formState, employeeId: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => fetchByEmployeeId(formState.employeeId)}
                        disabled={!formState.employeeId || fetchingHrmsId}
                        style={{
                          padding: '0 0.6rem',
                          background: '#f1f5f9',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: formState.employeeId ? 'pointer' : 'not-allowed',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {fetchingHrmsId ? '...' : 'Fetch'}
                      </button>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="col1_phone">
                      <span>Phone</span>
                    </Label>
                    <Input
                      id="col1_phone"
                      type="text"
                      placeholder="+91..."
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    />
                  </FormGroup>
                </div>

                {/* Password / HRMS Authentication Box */}
                {formState.employeeId ? (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #a7f3d0',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, fontSize: '0.86rem' }}>
                      <span>🔒</span>
                      <span>HRMS Authentication Active</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#065f46', lineHeight: '1.4' }}>
                      This employee signs in with Employee ID <strong>({formState.employeeId})</strong> and their confidential <strong>HRMS portal password</strong>. No password is typed or stored in SRS.
                    </p>
                  </div>
                ) : (
                  <FormGroup>
                    <Label htmlFor="col1_password">
                      <span>Password</span>
                      {!editingSubAdmin && <span className="required">*</span>}
                    </Label>
                    <div style={{ position: 'relative' }}>
                      <Input
                        id="col1_password"
                        type={showSubAdminPassword ? 'text' : 'password'}
                        value={formState.password}
                        onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                        placeholder={editingSubAdmin ? 'Leave blank to retain current' : 'Enter temporary password'}
                        required={!editingSubAdmin}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSubAdminPassword(!showSubAdminPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: '#64748b'
                        }}
                      >
                        {showSubAdminPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </FormGroup>
                )}
              </ColumnBody>
            </ColumnCard>

            {/* ─── COLUMN 2: Role Selection ─── */}
            <ColumnCard>
              <ColumnHeader $gradient="linear-gradient(135deg, #0284c7, #0369a1)">
                <h3 className="col-title">
                  <span>🛡️</span>
                  <span>Role Selection</span>
                </h3>
                <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                  {rolePresets.find((r) => r.id === selectedRoleId)?.badge || 'Custom'}
                </span>
              </ColumnHeader>

              <ColumnBody>
                <RoleCardsList>
                  {rolePresets.map((preset) => {
                    const isSelected = selectedRoleId === preset.id;
                    return (
                      <RoleOptionCard
                        key={preset.id}
                        $selected={isSelected}
                        $color={preset.color}
                        $bgColor={preset.bgColor}
                        onClick={() => handleSelectRolePreset(preset)}
                      >
                        <RoleIconSquircle $color={preset.color}>{preset.icon}</RoleIconSquircle>
                        <RoleInfo>
                          <div className="role-title">
                            <span>{preset.name}</span>
                            {isSelected && (
                              <span style={{ color: preset.color, fontSize: '0.8rem', fontWeight: 800 }}>✓</span>
                            )}
                          </div>
                          <p className="role-desc">{preset.description}</p>
                        </RoleInfo>
                      </RoleOptionCard>
                    );
                  })}
                </RoleCardsList>
              </ColumnBody>
            </ColumnCard>

            {/* ─── COLUMN 3: Access Scope ─── */}
            <ColumnCard>
              <ColumnHeader $gradient="linear-gradient(135deg, #059669, #047857)">
                <h3 className="col-title">
                  <span>🌐</span>
                  <span>Access Scope</span>
                </h3>
                <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
                  {Object.keys(formState.permissions || {}).length} module(s) enabled
                </span>
              </ColumnHeader>

              <ColumnBody>
                {/* Campus Selection */}
                <FormGroup>
                  <Label htmlFor="col3_campus">
                    <span>Campus Scope</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Optional (Global if unselected)</span>
                  </Label>
                  <Select
                    id="col3_campus"
                    value={formState.campus}
                    onChange={(e) => {
                      const c = e.target.value;
                      setFormState({ ...formState, campus: c, courses: [] });
                      fetchCoursesForCampus(c);
                    }}
                  >
                    <option value="">All Campuses (Unrestricted)</option>
                    {campuses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                {/* Courses Multi-select if campus chosen */}
                {formState.campus && courses.length > 0 && (
                  <FormGroup>
                    <Label>
                      <span>Specific Courses ({formState.courses.length} selected)</span>
                    </Label>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        padding: '0.5rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {courses.map((course) => {
                        const isChecked = formState.courses.includes(course._id);
                        return (
                          <label
                            key={course._id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.78rem',
                              background: isChecked ? '#e0f2fe' : 'white',
                              border: `1px solid ${isChecked ? '#0284c7' : '#cbd5e1'}`,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormState((prev) => ({
                                  ...prev,
                                  courses: checked
                                    ? [...prev.courses, course._id]
                                    : prev.courses.filter((id) => id !== course._id)
                                }));
                              }}
                            />
                            <span>{course.department}</span>
                          </label>
                        );
                      })}
                    </div>
                  </FormGroup>
                )}

                {/* Panel Member Access Card */}
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${formState.hasPanelMemberAccess ? '#f97316' : '#e2e8f0'}`,
                    background: formState.hasPanelMemberAccess ? '#fff7ed' : '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                      Grant Interview Panel Access
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Allows user to evaluate candidates in interview rounds
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!formState.hasPanelMemberAccess}
                    onChange={(e) => setFormState({ ...formState, hasPanelMemberAccess: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#f97316', cursor: 'pointer' }}
                  />
                </div>

                {/* Granular Module Permissions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Label>
                    <span>Role Module Permissions</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Fine-tune access</span>
                  </Label>

                  {availablePermissions.map((perm) => {
                    const currentLevel = formState.permissions?.[perm.key] || null;
                    return (
                      <PermissionRowCard key={perm.key} $enabled={Boolean(currentLevel)}>
                        <PermissionRowHeader>
                          <span className="perm-label">{perm.label}</span>
                          <AccessSegmentedGroup>
                            <SegmentButton
                              type="button"
                              $type="off"
                              $active={!currentLevel}
                              onClick={() => handlePermissionAccessChange(perm.key, null)}
                            >
                              Off
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $type="view"
                              $active={currentLevel === 'view_only'}
                              onClick={() => handlePermissionAccessChange(perm.key, 'view_only')}
                            >
                              View
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $type="full"
                              $active={currentLevel === 'full_access'}
                              onClick={() => handlePermissionAccessChange(perm.key, 'full_access')}
                            >
                              Full
                            </SegmentButton>
                          </AccessSegmentedGroup>
                        </PermissionRowHeader>
                        {perm.description && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                            {perm.description}
                          </div>
                        )}
                      </PermissionRowCard>
                    );
                  })}
                </div>
              </ColumnBody>
            </ColumnCard>
          </ThreeColumnLayout>

          {/* Bottom Action Bar */}
          <BottomActionBar>
            <SecondaryBtn
              type="button"
              onClick={() => {
                resetForm();
                setActiveTab('users');
              }}
            >
              Cancel
            </SecondaryBtn>

            <PrimaryBtn type="submit" disabled={saving}>
              <span>{saving ? 'Saving...' : editingSubAdmin ? 'Update User' : 'Create User'}</span>
            </PrimaryBtn>
          </BottomActionBar>
        </form>
      )}

      {/* ─── TAB 2: ALL USERS TABLE ──────────────────────────────────────── */}
      {activeTab === 'users' && (
        <TableWrapper>
          <TableToolbar>
            <SearchInputWrapper>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </SearchInputWrapper>

            <PrimaryBtn
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
            >
              + Create User
            </PrimaryBtn>
          </TableToolbar>

          {loading ? (
            <div style={{ padding: '2rem' }}>
              <SkeletonLoader rows={6} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No users found matching your search</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <thead>
                  <tr>
                    <Th>User</Th>
                    <Th>Campus</Th>
                    <Th>Access Scope</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const permCount = user.permissions
                      ? Array.isArray(user.permissions)
                        ? user.permissions.length
                        : Object.keys(user.permissions).length
                      : 0;

                    return (
                      <tr key={user._id}>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(2, 132, 199, 0.2))',
                                color: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1rem',
                                flexShrink: 0
                              }}
                            >
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span>{user.email}</span>
                                {user.employeeId && (
                                  <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
                                    ID: {user.employeeId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Td>

                        <Td>
                          <div style={{ fontWeight: 600 }}>{user.campus || 'All Campuses'}</div>
                          {user.courses && user.courses.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {user.courses.length} course(s)
                            </div>
                          )}
                        </Td>

                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                              {permCount} module{permCount !== 1 ? 's' : ''}
                            </span>
                            {user.hasPanelMemberAccess && (
                              <span style={{ background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.7rem' }}>
                                Panel
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewingPermissions(user)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0284c7',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'underline'
                              }}
                            >
                              View
                            </button>
                          </div>
                        </Td>

                        <Td>
                          <StatusPill $active={user.isActive}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </StatusPill>
                        </Td>

                        <Td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <ActionBtn onClick={() => handleEditUser(user)}>Edit</ActionBtn>
                            <ActionBtn onClick={() => handleStatusToggle(user)}>
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </ActionBtn>
                            <ActionBtn $variant="danger" onClick={() => handleDeleteUser(user._id)}>
                              Delete
                            </ActionBtn>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </TableWrapper>
      )}

      {/* ─── TAB 3: ROLE CONFIGURATION (MATCHING IMAGE 2) ─────────────────── */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%)',
              color: 'white',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(14, 165, 233, 0.25)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.3rem', fontWeight: 800 }}>
                ⚙️ Role Configuration
              </h3>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.88rem' }}>
                Set default module access per role. Edit names and add custom roles.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenNewRole}
                style={{
                  background: 'white',
                  color: '#0284c7',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <span>➕</span>
                <span>Add new role</span>
              </button>

              <button
                type="button"
                onClick={() => openRoleCreateModal(rolePresets[0])}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>👤</span>
                <span>+ Create User with Role</span>
              </button>
            </div>
          </div>

          {/* Grid of Role Cards */}
          <RolesGrid>
            {rolePresets.map((preset) => {
              const permCount = Object.keys(preset.defaultPermissions || {}).filter(
                (k) => preset.defaultPermissions[k]
              ).length;

              return (
                <RoleConfigCard key={preset.id} $color={preset.color}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <RoleIconSquircle $color={preset.color}>{preset.icon || '🛡️'}</RoleIconSquircle>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {preset.name}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: preset.color, fontWeight: 700 }}>
                          {preset.badge || 'Configured'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Quick assign this role"
                      onClick={() => openRoleCreateModal(preset)}
                      style={{
                        background: preset.bgColor || '#f0f9ff',
                        color: preset.color || '#0284c7',
                        border: `1px solid ${preset.color || '#0284c7'}`,
                        borderRadius: '6px',
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <span>+</span>
                      <span>Assign User</span>
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, flex: 1, minHeight: '36px' }}>
                    {preset.description || 'Standard access profile configured for portal operations.'}
                  </p>

                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.78rem',
                      color: '#334155',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{permCount} permission(s) configured</span>
                    {preset.hasPanelMemberAccess && (
                      <span style={{ color: '#059669', fontWeight: 700 }}>🎯 Panel Member</span>
                    )}
                  </div>

                  {/* Actions matching Image 2 */}
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(preset)}
                      style={{
                        flex: 1,
                        background: 'white',
                        color: '#334155',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.55rem 0.75rem',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0ea5e9';
                        e.currentTarget.style.color = '#0284c7';
                        e.currentTarget.style.background = '#f0f9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#334155';
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <span>✏️</span>
                      <span>Edit name & configure</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRole(preset)}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1.5px solid #fecaca',
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.borderColor = '#f87171';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                      }}
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </RoleConfigCard>
              );
            })}
          </RolesGrid>
        </div>
      )}



      {/* ─── VIEW PERMISSIONS MODAL ─────────────────────────────────────── */}
      {viewingPermissions && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setViewingPermissions(null); }}>
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {viewingPermissions.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Configured Module Permissions</p>
              </div>
              <button
                onClick={() => setViewingPermissions(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
              {availablePermissions.map((p) => {
                let access = null;
                if (Array.isArray(viewingPermissions.permissions)) {
                  if (viewingPermissions.permissions.includes(p.key)) access = 'full_access';
                } else if (viewingPermissions.permissions && viewingPermissions.permissions[p.key]) {
                  access = viewingPermissions.permissions[p.key];
                }

                return (
                  <div
                    key={p.key}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: access ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${access ? '#a7f3d0' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: access ? '#065f46' : '#64748b' }}>
                        {p.label}
                      </div>
                      {p.description && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.description}</div>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: access === 'full_access' ? '#dcfce7' : access === 'view_only' ? '#e0f2fe' : '#f1f5f9',
                        color: access === 'full_access' ? '#15803d' : access === 'view_only' ? '#0369a1' : '#94a3b8'
                      }}
                    >
                      {access === 'full_access' ? 'Full Access' : access === 'view_only' ? 'View Only' : 'Disabled'}
                    </span>
                  </div>
                );
              })}
            </div>

            <SecondaryBtn onClick={() => setViewingPermissions(null)}>Close</SecondaryBtn>
          </div>
        </ModalOverlay>
      )}

      {/* ─── EDIT / CONFIGURE ROLE MODAL ─────────────────────────────────── */}
      {showRoleConfigModal && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowRoleConfigModal(false); }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${roleConfigForm.color || '#0284c7'}, #0369a1)`,
                color: 'white',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}
                >
                  {roleConfigForm.icon || '⚙️'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    {roleConfigIsNew ? 'Add New Role Profile' : `Edit Role: ${roleConfigForm.name}`}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85 }}>
                    Configure role name, description, and module access permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleConfigModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.75rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRoleConfig} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                
                {/* Role Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                  <FormGroup>
                    <Label>Role Name <span className="required">*</span></Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. College Principal"
                      value={roleConfigForm.name}
                      onChange={(e) => setRoleConfigForm({ ...roleConfigForm, name: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Badge Tag</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Full Access, Lead"
                      value={roleConfigForm.badge}
                      onChange={(e) => setRoleConfigForm({ ...roleConfigForm, badge: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Icon</Label>
                    <select
                      value={roleConfigForm.icon}
                      onChange={(e) => setRoleConfigForm({ ...roleConfigForm, icon: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        background: 'white'
                      }}
                    >
                      <option value="🛡️">🛡️ Shield</option>
                      <option value="👥">👥 People</option>
                      <option value="📝">📝 Assessment</option>
                      <option value="🎯">🎯 Target</option>
                      <option value="📋">📋 Clipboard</option>
                      <option value="👁️">👁️ Eye</option>
                      <option value="⚙️">⚙️ Gear</option>
                      <option value="🏫">🏫 College</option>
                      <option value="💼">💼 Briefcase</option>
                      <option value="🎓">🎓 Academic</option>
                    </select>
                  </FormGroup>
                </div>

                <FormGroup>
                  <Label>Description</Label>
                  <Input
                    as="textarea"
                    rows="2"
                    placeholder="Brief description of this role's scope and responsibilities..."
                    value={roleConfigForm.description}
                    onChange={(e) => setRoleConfigForm({ ...roleConfigForm, description: e.target.value })}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </FormGroup>

                {/* Theme Color Picker */}
                <FormGroup>
                  <Label>Card Accent Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { hex: '#0284c7', bg: '#f0f9ff' },
                      { hex: '#0ea5e9', bg: '#e0f2fe' },
                      { hex: '#059669', bg: '#f0fdf4' },
                      { hex: '#0891b2', bg: '#ecfeff' },
                      { hex: '#d97706', bg: '#fffbeb' },
                      { hex: '#7c3aed', bg: '#faf5ff' },
                      { hex: '#475569', bg: '#f8fafc' },
                      { hex: '#dc2626', bg: '#fef2f2' },
                      { hex: '#2563eb', bg: '#eff6ff' }
                    ].map((c) => (
                      <div
                        key={c.hex}
                        onClick={() => setRoleConfigForm({ ...roleConfigForm, color: c.hex, bgColor: c.bg })}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: c.hex,
                          cursor: 'pointer',
                          border: roleConfigForm.color === c.hex ? '3px solid #0f172a' : '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          transform: roleConfigForm.color === c.hex ? 'scale(1.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </FormGroup>

                {/* Panel Member Access */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      🎯 Interview Panel Member Access
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Allow users with this role to participate in interviews and submit candidate evaluation scores
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(roleConfigForm.hasPanelMemberAccess)}
                      onChange={(e) => setRoleConfigForm({ ...roleConfigForm, hasPanelMemberAccess: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0284c7' }}
                    />
                  </label>
                </div>

                {/* Module Permissions Matrix */}
                <div>
                  <div style={{ marginBottom: '0.65rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      Default Module Permissions
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Set the default permission level granted for each portal module
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {availablePermissions.map((perm) => {
                      const currentLevel = roleConfigForm.defaultPermissions?.[perm.key] || null;

                      return (
                        <div
                          key={perm.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            background: currentLevel ? '#f8fafc' : 'white',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
                              {perm.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {perm.description}
                            </div>
                          </div>

                          <AccessSegmentedGroup>
                            <SegmentButton
                              type="button"
                              $active={!currentLevel}
                              onClick={() => {
                                const copy = { ...roleConfigForm.defaultPermissions };
                                delete copy[perm.key];
                                setRoleConfigForm({ ...roleConfigForm, defaultPermissions: copy });
                              }}
                            >
                              Off
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $active={currentLevel === 'view_only'}
                              onClick={() => {
                                setRoleConfigForm({
                                  ...roleConfigForm,
                                  defaultPermissions: { ...roleConfigForm.defaultPermissions, [perm.key]: 'view_only' }
                                });
                              }}
                            >
                              View
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $active={currentLevel === 'full_access'}
                              onClick={() => {
                                setRoleConfigForm({
                                  ...roleConfigForm,
                                  defaultPermissions: { ...roleConfigForm.defaultPermissions, [perm.key]: 'full_access' }
                                });
                              }}
                            >
                              Full
                            </SegmentButton>
                          </AccessSegmentedGroup>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.85rem'
                }}
              >
                <SecondaryBtn type="button" onClick={() => setShowRoleConfigModal(false)}>
                  Cancel
                </SecondaryBtn>
                <PrimaryBtn type="submit">
                  {roleConfigIsNew ? 'Create Role Profile' : 'Save Changes'}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ─── ROLE CONFIGURATION: CREATE USER MODAL (POPUP) ───────────────── */}
      {showRoleUserModal && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowRoleUserModal(false); }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${roleModalPreset.color}, #1e293b)`,
                color: 'white',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem'
                  }}
                >
                  {roleModalPreset.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                    Create User with {roleModalPreset.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85 }}>
                    Configure user credentials and assign role scope in this popup
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleUserModal(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.75rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRoleModalSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  padding: '1.5rem',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.15fr',
                  gap: '1.5rem',
                  flex: 1
                }}
              >
                {/* Left Column: Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid #e2e8f0'
                    }}
                  >
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>
                      👤 User Credentials
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setHrmsTargetForm('roleModal');
                        setHrmsQuery('');
                        setHrmsResults([]);
                        setHrmsError('');
                        setShowHrmsModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                        color: 'white',
                        border: 'none',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <span>🔍</span>
                      <span>Import from HRMS</span>
                    </button>
                  </div>

                  <FormGroup>
                    <Label>
                      <span>Full Name</span>
                      <span className="required">*</span>
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={roleModalForm.name}
                      onChange={(e) => setRoleModalForm({ ...roleModalForm, name: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>
                      <span>Email Address</span>
                      <span className="required">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={roleModalForm.email}
                      onChange={(e) => setRoleModalForm({ ...roleModalForm, email: e.target.value })}
                    />
                  </FormGroup>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormGroup>
                      <Label>
                        <span>Employee ID (HRMS)</span>
                      </Label>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <Input
                          type="text"
                          placeholder="e.g. 2145"
                          value={roleModalForm.employeeId}
                          onChange={(e) => setRoleModalForm({ ...roleModalForm, employeeId: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => fetchByEmployeeId(roleModalForm.employeeId, 'roleModal')}
                          disabled={!roleModalForm.employeeId || fetchingHrmsId}
                          style={{
                            padding: '0 0.5rem',
                            background: '#f1f5f9',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: roleModalForm.employeeId ? 'pointer' : 'not-allowed'
                          }}
                        >
                          Fetch
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label>Phone</Label>
                      <Input
                        type="text"
                        placeholder="+91..."
                        value={roleModalForm.phone}
                        onChange={(e) => setRoleModalForm({ ...roleModalForm, phone: e.target.value })}
                      />
                    </FormGroup>
                  </div>

                  {roleModalForm.employeeId ? (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1.5px solid #a7f3d0',
                        borderRadius: '10px',
                        padding: '0.75rem',
                        fontSize: '0.78rem',
                        color: '#065f46'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>🔒</span>
                          <span>HRMS Authentication Active ({roleModalForm.employeeId})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRoleModalForm({ ...roleModalForm, employeeId: '', password: '' })}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      User will authenticate using their confidential HRMS portal password. No password is stored in SRS.
                    </div>
                  ) : (
                    <FormGroup>
                      <Label>
                        <span>Temporary Password</span>
                        <span className="required">*</span>
                      </Label>
                      <Input
                        type="password"
                        required
                        placeholder="Enter temporary password"
                        value={roleModalForm.password}
                        onChange={(e) => setRoleModalForm({ ...roleModalForm, password: e.target.value })}
                      />
                    </FormGroup>
                  )}
                </div>

                {/* Right Column: Role Scope & Module Access */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '0.5rem',
                      borderBottom: '2px solid #e2e8f0'
                    }}
                  >
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>
                      🌐 Access Scope & Modules
                    </h4>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: roleModalPreset.bgColor,
                        color: roleModalPreset.color,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {roleModalPreset.name}
                    </span>
                  </div>

                  <FormGroup>
                    <Label>Campus Scope</Label>
                    <Select
                      value={roleModalForm.campus}
                      onChange={(e) => {
                        const c = e.target.value;
                        setRoleModalForm({ ...roleModalForm, campus: c, courses: [] });
                        fetchCoursesForRoleModal(c);
                      }}
                    >
                      <option value="">All Campuses (Unrestricted)</option>
                      {campuses.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </FormGroup>

                  {roleModalForm.campus && roleModalCourses.length > 0 && (
                    <FormGroup>
                      <Label>Specific Courses ({roleModalForm.courses.length} selected)</Label>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.3rem',
                          maxHeight: '90px',
                          overflowY: 'auto',
                          padding: '0.4rem',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {roleModalCourses.map((crs) => {
                          const isChecked = roleModalForm.courses.includes(crs._id);
                          return (
                            <label
                              key={crs._id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem',
                                background: isChecked ? '#e0f2fe' : 'white',
                                border: `1px solid ${isChecked ? '#0284c7' : '#cbd5e1'}`,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const chk = e.target.checked;
                                  setRoleModalForm((prev) => ({
                                    ...prev,
                                    courses: chk
                                      ? [...prev.courses, crs._id]
                                      : prev.courses.filter((id) => id !== crs._id)
                                  }));
                                }}
                              />
                              <span>{crs.department}</span>
                            </label>
                          );
                        })}
                      </div>
                    </FormGroup>
                  )}

                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${roleModalForm.hasPanelMemberAccess ? '#f97316' : '#e2e8f0'}`,
                      background: roleModalForm.hasPanelMemberAccess ? '#fff7ed' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                      Grant Interview Panel Access
                    </span>
                    <input
                      type="checkbox"
                      checked={!!roleModalForm.hasPanelMemberAccess}
                      onChange={(e) => setRoleModalForm({ ...roleModalForm, hasPanelMemberAccess: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#f97316', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
                    <Label>Module Access Levels</Label>
                    {availablePermissions.map((perm) => {
                      const currentLevel = roleModalForm.permissions?.[perm.key] || null;
                      return (
                        <div
                          key={perm.key}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: `1px solid ${currentLevel ? '#a7f3d0' : '#e2e8f0'}`,
                            background: currentLevel ? '#f0fdf4' : '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{perm.label}</span>
                          <AccessSegmentedGroup>
                            <SegmentButton
                              type="button"
                              $type="off"
                              $active={!currentLevel}
                              onClick={() => {
                                const updated = { ...roleModalForm.permissions };
                                delete updated[perm.key];
                                setRoleModalForm({ ...roleModalForm, permissions: updated });
                              }}
                            >
                              Off
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $type="view"
                              $active={currentLevel === 'view_only'}
                              onClick={() => {
                                setRoleModalForm({
                                  ...roleModalForm,
                                  permissions: { ...roleModalForm.permissions, [perm.key]: 'view_only' }
                                });
                              }}
                            >
                              View
                            </SegmentButton>
                            <SegmentButton
                              type="button"
                              $type="full"
                              $active={currentLevel === 'full_access'}
                              onClick={() => {
                                setRoleModalForm({
                                  ...roleModalForm,
                                  permissions: { ...roleModalForm.permissions, [perm.key]: 'full_access' }
                                });
                              }}
                            >
                              Full
                            </SegmentButton>
                          </AccessSegmentedGroup>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.85rem'
                }}
              >
                <SecondaryBtn type="button" onClick={() => setShowRoleUserModal(false)}>
                  Cancel
                </SecondaryBtn>
                <PrimaryBtn type="submit" disabled={roleModalSaving}>
                  {roleModalSaving ? 'Creating...' : `Create User (${roleModalPreset.shortTitle || roleModalPreset.name})`}
                </PrimaryBtn>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* ─── HRMS SEARCH MODAL (PRIORITY OVERLAY: Z-INDEX 3000) ───────────── */}
      {showHrmsModal && (
        <PriorityModalOverlay
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHrmsModal(false);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  🏢
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Search HRMS Employee
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {hrmsTargetForm === 'roleModal'
                      ? `Select an employee for ${roleModalPreset.name}`
                      : 'Search by Employee ID or Name'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHrmsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                autoFocus
                type="text"
                placeholder="Type employee ID (e.g. 2145) or name..."
                value={hrmsQuery}
                onChange={handleHrmsQueryChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                🔍
              </span>
              {hrmsSearching && (
                <div style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#0284c7' }}>
                  Searching...
                </div>
              )}
            </div>

            {hrmsError && !hrmsSearching && (
              <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', textAlign: 'center' }}>
                {hrmsError}
              </div>
            )}

            {hrmsResults.length > 0 && (
              <div style={{ overflowY: 'auto', maxHeight: '320px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {hrmsResults.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => selectHrmsEmployee(emp)}
                    style={{
                      padding: '0.875rem 1rem',
                      border: '1.5px solid #e0f2fe',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0ea5e9';
                      e.currentTarget.style.background = '#f0f9ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0f2fe';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                      }}
                    >
                      {emp.employee_name ? emp.employee_name.charAt(0).toUpperCase() : '?'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {emp.employee_name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span>🆔 {emp.emp_no}</span>
                        {emp.email && <span>📧 {emp.email}</span>}
                        {emp.designation && <span>💼 {emp.designation}</span>}
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          🔒 HRMS Account
                        </span>
                      </div>
                    </div>

                    <div style={{ color: '#0284c7', fontWeight: 800, fontSize: '1.1rem' }}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PriorityModalOverlay>
      )}
    </Container>
  );
};

export default SubAdminManagement;
