import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import SkeletonLoader from '../SkeletonLoader';
import ToastNotificationContainer from '../ToastNotificationContainer';

const Container = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 2vw, 2.5rem);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

const Title = styled.h2`
  color: #1e293b;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #06b6d4, #22d3ee);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
    background: linear-gradient(135deg, #f97316, #fb923c);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.25rem 1.5rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.875rem;
  color: #334155;
  border-bottom: 2px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  color: #475569;
  vertical-align: top;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8fafc;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${({ $variant, variant }) => {
    switch ($variant || variant) {
      case 'danger':
        return '#fee2e2';
      case 'secondary':
        return '#f1f5f9';
      default:
        return '#dcfce7';
    }
  }};
  color: ${({ $variant, variant }) => {
    switch ($variant || variant) {
      case 'danger':
        return '#0891b2';
      case 'secondary':
        return '#475569';
      default:
        return '#15803d';
    }
  }};
  border: 1px solid ${({ $variant, variant }) => {
    switch ($variant || variant) {
      case 'danger':
        return '#fecaca';
      case 'secondary':
        return '#e2e8f0';
      default:
        return '#bbf7d0';
    }
  }};
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
    background: ${({ variant }) => {
      switch (variant) {
        case 'danger':
          return '#fecaca';
        case 'secondary':
          return '#e2e8f0';
        default:
          return '#bbf7d0';
      }
    }};
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  max-height: 95vh;
  padding: 1.5rem 2rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  margin: auto;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    max-width: 95vw;
    padding: 1.25rem 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-height: 98vh;
  }
`;

const SectionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const SectionContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  overflow-y: auto;
  min-height: 0;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  color: #94a3b8;

  &:hover {
    color: #475569;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow: hidden;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  letter-spacing: -0.01em;
`;

const Input = styled.input`
  padding: 0.625rem 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #ffffff;

  &:focus {
    outline: none;
    border-color: #06b6d4;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #fff;
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }
`;

const PermissionCard = styled.div`
  border: 2px solid ${({ enabled }) => (enabled ? 'rgba(249, 115, 22, 0.4)' : '#e2e8f0')};
  border-radius: 8px;
  padding: 0.75rem;
  background: ${({ enabled }) => (enabled ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.03) 100%)' : 'white')};
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${({ enabled }) => (enabled ? '2px' : '0')};
    background: linear-gradient(90deg, #06b6d4, #22d3ee);
    transition: height 0.2s ease;
    border-radius: 8px 8px 0 0;
  }

  &:hover {
    border-color: ${({ enabled }) => (enabled ? 'rgba(249, 115, 22, 0.5)' : '#cbd5e1')};
    transform: translateY(-1px);
    box-shadow: ${({ enabled }) => (enabled ? '0 2px 8px rgba(249, 115, 22, 0.12)' : '0 1px 4px rgba(15, 23, 42, 0.06)')};
  }
`;

const PermissionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
`;

const PermissionCheckbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #06b6d4;
  flex-shrink: 0;
  margin: 0;
  
  &:checked {
    filter: drop-shadow(0 1px 3px rgba(249, 115, 22, 0.3));
  }
`;

const PermissionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
`;

const PermissionLabel = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  line-height: 1.3;
`;

const PermissionAccessControl = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
`;

const AccessLevelGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const AccessLevelOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
  background: ${({ selected }) => (selected ? 'rgba(249, 115, 22, 0.1)' : 'transparent')};
  border: 2px solid ${({ selected }) => (selected ? 'rgba(249, 115, 22, 0.3)' : 'rgba(226, 232, 240, 0.5)')};
  
  input[type="radio"] {
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: #06b6d4;
    margin: 0;
    flex-shrink: 0;
  }
  
  span {
    white-space: nowrap;
  }
  
  &:hover {
    color: #1e293b;
    background: ${({ selected }) => (selected ? 'rgba(249, 115, 22, 0.15)' : 'rgba(15, 23, 42, 0.03)')};
    border-color: ${({ selected }) => (selected ? 'rgba(249, 115, 22, 0.4)' : 'rgba(15, 23, 42, 0.15)')};
    transform: translateY(-1px);
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #f97316, #fb923c);
    border-radius: 2px;
  }
`;

const PermissionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.875rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

const SubmitButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    background: linear-gradient(135deg, #059669, #047857);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  background: white;
  color: #475569;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #334155;
  }
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
  background: ${({ $active, active }) => (($active ?? active) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)')};
  color: ${({ $active, active }) => (($active ?? active) ? '#047857' : '#0891b2')};
`;

const PermissionList = styled.ul`
  margin: 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #475569;
`;

const SubAdminManagement = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [viewingPermissions, setViewingPermissions] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showSubAdminPassword, setShowSubAdminPassword] = useState(true);
  const [fetchingHrmsId, setFetchingHrmsId] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    employeeId: '',
    email: '',
    password: '',
    campus: '',
    courses: [],
    permissions: {}, // Object: { 'forms.manage': 'read_only' | 'full_access', ... }
    hasPanelMemberAccess: false
  });

  // HRMS employee search state
  const [showHrmsModal, setShowHrmsModal] = useState(false);
  const [hrmsQuery, setHrmsQuery] = useState('');
  const [hrmsResults, setHrmsResults] = useState([]);
  const [hrmsSearching, setHrmsSearching] = useState(false);
  const [hrmsError, setHrmsError] = useState('');
  const hrmsSearchTimer = React.useRef(null);

  const permissionDetails = useMemo(() => {
    return availablePermissions.reduce((acc, permission) => {
      acc[permission.key] = permission;
      return acc;
    }, {});
  }, [availablePermissions]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchCampuses = async () => {
    try {
      const response = await api.get('/courses/campuses/list');
      const fetchedCampuses = response.data.campuses || [];
      setCampuses(fetchedCampuses);
      console.log('Campuses fetched:', fetchedCampuses);
    } catch (error) {
      console.error('Error fetching campuses:', error);
      setToast({ type: 'danger', message: 'Failed to load campuses. Please refresh the page.' });
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
      password: '',
      campus: '',
      courses: [],
      permissions: {},
      hasPanelMemberAccess: false
    });
    setEditingSubAdmin(null);
    setCourses([]);
    setShowSubAdminPassword(false);
  };

  // ─── HRMS Search Handlers ───────────────────────────────────────────────────
  const openHrmsModal = () => {
    setHrmsQuery('');
    setHrmsResults([]);
    setHrmsError('');
    setShowHrmsModal(true);
  };

  const closeHrmsModal = () => {
    setShowHrmsModal(false);
    setHrmsQuery('');
    setHrmsResults([]);
    setHrmsError('');
    if (hrmsSearchTimer.current) clearTimeout(hrmsSearchTimer.current);
  };

  const handleHrmsQueryChange = (e) => {
    const value = e.target.value;
    setHrmsQuery(value);
    setHrmsError('');

    if (hrmsSearchTimer.current) clearTimeout(hrmsSearchTimer.current);

    if (value.trim().length < 2) {
      setHrmsResults([]);
      return;
    }

    hrmsSearchTimer.current = setTimeout(async () => {
      try {
        setHrmsSearching(true);
        const { data } = await api.get(`/auth/hrms/search-employees?q=${encodeURIComponent(value.trim())}`);
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

  const fetchByEmployeeId = async (empNo) => {
    if (!empNo || !empNo.trim()) return;
    try {
      setFetchingHrmsId(true);
      const { data } = await api.get(`/auth/hrms/search-employees?q=${encodeURIComponent(empNo.trim())}`);
      const matches = data.employees || [];
      const exact = matches.find(e => String(e.emp_no).trim() === String(empNo).trim()) || matches[0];
      if (exact) {
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

  const selectHrmsEmployee = (employee) => {
    const fallbackEmail = employee.email || (employee.emp_no ? `${employee.emp_no}@pydah.edu.in` : '');
    setFormState((prev) => ({
      ...prev,
      name: employee.employee_name || prev.name,
      employeeId: employee.emp_no || prev.employeeId,
      email: fallbackEmail || prev.email,
      password: '', // Authenticated securely via employee's HRMS credentials
    }));
    closeHrmsModal();
    setToast({ 
      type: 'success', 
      message: `✓ Linked ${employee.employee_name} (${employee.emp_no}) from HRMS` 
    });
  };

  const openCreateModal = async () => {
    // Ensure campuses are loaded before opening modal
    if (campuses.length === 0) {
      await fetchCampuses();
    }
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (subAdmin) => {
    setEditingSubAdmin(subAdmin);
    
    // Ensure campuses are loaded before opening modal
    if (campuses.length === 0) {
      await fetchCampuses();
    }
    
    // Convert permissions from array (old format) or object (new format) to object format
    let permissionsObj = {};
    if (Array.isArray(subAdmin.permissions)) {
      // Old format: convert array to object with full_access (legacy support)
      subAdmin.permissions.forEach(key => {
        permissionsObj[key] = 'full_access';
      });
    } else if (typeof subAdmin.permissions === 'object' && subAdmin.permissions !== null) {
      permissionsObj = subAdmin.permissions;
    }
    
    const subAdminCourses = subAdmin.courses ? subAdmin.courses.map(c => typeof c === 'object' ? c._id : c) : [];
    
    setFormState({
      name: subAdmin.name,
      employeeId: subAdmin.employeeId || '',
      email: subAdmin.email,
      password: '',
      campus: subAdmin.campus || '',
      courses: subAdminCourses,
      permissions: permissionsObj,
      isActive: subAdmin.isActive,
      hasPanelMemberAccess: subAdmin.hasPanelMemberAccess === true
    });
    
    // Fetch courses for the sub-admin's campus
    if (subAdmin.campus) {
      await fetchCoursesForCampus(subAdmin.campus);
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'campus') {
      // When campus changes, fetch courses for that campus and reset selected courses
      setFormState((prev) => ({
        ...prev,
        campus: value,
        courses: [] // Reset courses when campus changes
      }));
      fetchCoursesForCampus(value);
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const togglePermission = (permissionKey) => {
    setFormState((prev) => {
      const current = prev.permissions || {};
      const newPermissions = { ...current };
      
      if (newPermissions[permissionKey]) {
        // Remove permission if it exists
        delete newPermissions[permissionKey];
      } else {
        // Add permission with default 'view_only' access
        newPermissions[permissionKey] = 'view_only';
      }
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const setPermissionAccess = (permissionKey, accessLevel) => {
    setFormState((prev) => {
      const current = prev.permissions || {};
      return {
        ...prev,
        permissions: {
          ...current,
          [permissionKey]: accessLevel
        }
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = {
        name: formState.name,
        employeeId: formState.employeeId ? formState.employeeId.trim() : undefined,
        email: formState.email,
        campus: formState.campus || null,
        courses: formState.courses && formState.courses.length > 0 ? formState.courses : undefined,
        permissions: formState.permissions,
        hasPanelMemberAccess: formState.hasPanelMemberAccess
      };

      if (!editingSubAdmin) {
        if (formState.password && formState.password.trim()) {
          payload.password = formState.password.trim();
        }
        await api.post('/auth/sub-admins', payload);
      } else {
        if (formState.password) {
          payload.password = formState.password;
        }
        payload.isActive = formState.isActive;
        await api.put(`/auth/sub-admins/${editingSubAdmin._id}`, payload);
      }

      await fetchSubAdmins();
      setShowModal(false);
      resetForm();
      setToast({ type: 'success', message: editingSubAdmin ? 'Sub admin updated successfully.' : 'Sub admin created successfully.' });
    } catch (error) {
      console.error('Failed to save sub admin', error);
      setToast({ type: 'danger', message: error.response?.data?.message || 'Unable to save sub admin' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subAdminId) => {
    if (!window.confirm('Are you sure you want to remove this sub admin? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/auth/sub-admins/${subAdminId}`);
      await fetchSubAdmins();
      setToast({ type: 'success', message: 'Sub admin deleted successfully.' });
    } catch (error) {
      console.error('Failed to delete sub admin', error);
      setToast({ type: 'danger', message: error.response?.data?.message || 'Unable to delete sub admin' });
    }
  };

  const handleStatusToggle = async (subAdmin) => {
    try {
      await api.put(`/auth/users/${subAdmin._id}/status`, { isActive: !subAdmin.isActive });
      await fetchSubAdmins();
      setToast({ type: 'success', message: `Sub admin is now ${!subAdmin.isActive ? 'active' : 'inactive'}.` });
    } catch (error) {
      console.error('Failed to update sub admin status', error);
      setToast({ type: 'danger', message: error.response?.data?.message || 'Unable to update status' });
    }
  };

  return (
    <Container>
      <Header>
        <Title>Delegated Access & Sub Admins</Title>
      </Header>

      <Toolbar>
        <div>
          <strong>{subAdmins.length}</strong> sub admin{subAdmins.length === 1 ? '' : 's'} configured
        </div>
        <AddButton onClick={openCreateModal}>Add Sub Admin</AddButton>
      </Toolbar>

      {loading ? (
        <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <SkeletonLoader loading={true} variant="table" rows={6} columns="1.5fr 1.5fr 1fr 1fr 1.2fr" />
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)' }}>
          <Table style={{ minWidth: '720px', border: 'none', boxShadow: 'none' }}>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Campus</Th>
            <Th>Status</Th>
            <Th style={{ width: '220px' }}>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {subAdmins.map((subAdmin) => (
            <tr key={subAdmin._id}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{subAdmin.name}</span>
                  {subAdmin.employeeId && (
                    <span style={{
                      padding: '0.12rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ID: {subAdmin.employeeId}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  User Management
                  {subAdmin.hasPanelMemberAccess && (
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      + Panel Member
                    </span>
                  )}
                </div>
              </Td>
              <Td>{subAdmin.email}</Td>
              <Td>
                {subAdmin.campus ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.625rem', 
                      borderRadius: '6px', 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'inline-block',
                      width: 'fit-content'
                    }}>
                      {subAdmin.campus}
                    </span>
                    {subAdmin.courses && subAdmin.courses.length > 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        <span style={{ fontWeight: 500 }}>Depts:</span>
                        {subAdmin.courses.slice(0, 3).map((course, idx) => (
                          <span
                            key={typeof course === 'object' ? course._id : course}
                            style={{
                              background: '#e0e7ff',
                              color: '#3730a3',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}
                          >
                            {typeof course === 'object' ? course.department : 'N/A'}
                          </span>
                        ))}
                        {subAdmin.courses.length > 3 && (
                          <span style={{ 
                            color: '#64748b',
                            fontWeight: 500,
                            padding: '0.15rem 0.4rem'
                          }}>
                            +{subAdmin.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: '#94a3b8',
                        fontStyle: 'italic'
                      }}>
                        All departments
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>All Campuses</span>
                )}
              </Td>
              <Td>
                <StatusPill $active={subAdmin.isActive}>
                  {subAdmin.isActive ? 'Active' : 'Inactive'}
                </StatusPill>
              </Td>
              <Td>
                <Actions>
                  <ActionButton 
                    $variant="secondary" 
                    onClick={() => {
                      setViewingPermissions(subAdmin);
                      setShowPermissionsModal(true);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  >
                    View
                  </ActionButton>
                  <ActionButton onClick={() => openEditModal(subAdmin)}>Edit</ActionButton>
                  <ActionButton $variant="secondary" onClick={() => handleStatusToggle(subAdmin)}>
                    {subAdmin.isActive ? 'Deactivate' : 'Activate'}
                  </ActionButton>
                  <ActionButton $variant="danger" onClick={() => handleDelete(subAdmin._id)}>
                    Remove
                  </ActionButton>
                </Actions>
              </Td>
            </tr>
          ))}
        </tbody>
          </Table>
        </div>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingSubAdmin ? 'Update Sub Admin' : 'Create Sub Admin'}</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <SectionsContainer>
                {/* Section 1: User Details */}
                <SectionWrapper>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid #e2e8f0' }}>
                    <SectionTitle style={{ margin: 0, paddingBottom: 0, borderBottom: 'none' }}>User Details</SectionTitle>
                    <button
                      type="button"
                      onClick={openHrmsModal}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.35)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.45)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.35)'; }}
                    >
                      <span style={{ fontSize: '1rem' }}>🏢</span>
                      From HRMS
                    </button>
                  </div>
                  <SectionContent>
                    <FormGroup>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter full name"
                      />
                    </FormGroup>

                    <FormGroup>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <Label htmlFor="employeeId" style={{ margin: 0 }}>Employee ID (HRMS)</Label>
                        {formState.employeeId && (
                          <span style={{ fontSize: '0.72rem', background: '#ede9fe', color: '#6d28d9', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                            Sign-In ID
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Input
                          id="employeeId"
                          name="employeeId"
                          type="text"
                          value={formState.employeeId}
                          onChange={handleInputChange}
                          placeholder="e.g. 2145"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => fetchByEmployeeId(formState.employeeId)}
                          disabled={!formState.employeeId || fetchingHrmsId}
                          style={{
                            padding: '0 0.875rem',
                            background: '#f1f5f9',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: '#334155',
                            cursor: formState.employeeId ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {fetchingHrmsId ? 'Fetching...' : '🔍 Fetch HRMS'}
                        </button>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter email address"
                      />
                    </FormGroup>

                    {formState.employeeId ? (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem' }}>
                          <span>🔒</span>
                          <span>HRMS Authentication</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#15803d', lineHeight: '1.4' }}>
                          User will sign in with their <strong>Employee ID ({formState.employeeId})</strong> and their confidential <strong>HRMS portal password</strong>.
                        </p>
                      </div>
                    ) : (
                      <FormGroup>
                        <Label htmlFor="password">Temporary Password</Label>
                        <div style={{ position: 'relative' }}>
                          <Input
                            id="password"
                            name="password"
                            type={showSubAdminPassword ? 'text' : 'password'}
                            value={formState.password}
                            onChange={handleInputChange}
                            placeholder={editingSubAdmin ? 'Leave blank to keep existing password' : 'Enter temporary password'}
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
                              padding: '2px 4px',
                              color: '#64748b'
                            }}
                            title={showSubAdminPassword ? 'Hide password' : 'Show password'}
                          >
                            {showSubAdminPassword ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </FormGroup>
                    )}

                    <FormGroup>
                      <Label htmlFor="campus">Campus (Optional)</Label>
                      <select
                        id="campus"
                        name="campus"
                        value={formState.campus}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.625rem 0.875rem',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          background: '#ffffff',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#06b6d4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="">All Campuses (No Restriction)</option>
                        {campuses && campuses.length > 0 ? (
                          campuses.map(campus => (
                            <option key={campus} value={campus}>{campus}</option>
                          ))
                        ) : (
                          <option value="" disabled>Loading campuses...</option>
                        )}
                      </select>
                    </FormGroup>

                    {formState.campus && courses.length > 0 && (
                      <FormGroup>
                        <Label>Department Restriction (Optional)</Label>
                        <div style={{
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          background: '#ffffff',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {courses.map(course => {
                            const isSelected = formState.courses.includes(course._id);
                            return (
                              <label
                                key={course._id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.625rem',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  background: isSelected ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
                                  border: `1px solid ${isSelected ? 'rgba(249, 115, 22, 0.2)' : 'transparent'}`,
                                  fontSize: '0.875rem',
                                  color: '#1e293b',
                                  fontWeight: isSelected ? 500 : 400
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = '#f8fafc';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = 'transparent';
                                  }
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormState((prev) => ({
                                        ...prev,
                                        courses: [...prev.courses, course._id]
                                      }));
                                    } else {
                                      setFormState((prev) => ({
                                        ...prev,
                                        courses: prev.courses.filter(id => id !== course._id)
                                      }));
                                    }
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#06b6d4',
                                    flexShrink: 0
                                  }}
                                />
                                <span>{course.department}</span>
                              </label>
                            );
                          })}
                        </div>
                      </FormGroup>
                    )}

                  </SectionContent>
                </SectionWrapper>

                {/* Section 2: Permissions & Access Levels */}
                <SectionWrapper>
                  <SectionTitle>Permissions & Access Levels</SectionTitle>
                  <PermissionsSection>
                    {availablePermissions.map((permission) => {
                      const isEnabled = !!formState.permissions[permission.key];
                      const accessLevel = formState.permissions[permission.key] || 'view_only';
                      return (
                        <PermissionCard 
                          key={permission.key} 
                          enabled={isEnabled}
                          onClick={() => !isEnabled && togglePermission(permission.key)}
                        >
                          <PermissionHeader>
                            <PermissionCheckbox
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => togglePermission(permission.key)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <PermissionDetails>
                              <PermissionLabel>{permission.label}</PermissionLabel>
                            </PermissionDetails>
                          </PermissionHeader>
                          {isEnabled && (
                            <PermissionAccessControl onClick={(e) => e.stopPropagation()}>
                              <AccessLevelGroup>
                                <AccessLevelOption selected={accessLevel === 'view_only'}>
                                  <input
                                    type="radio"
                                    name={`access-${permission.key}`}
                                    value="view_only"
                                    checked={accessLevel === 'view_only'}
                                    onChange={() => setPermissionAccess(permission.key, 'view_only')}
                                  />
                                  <span>View Only</span>
                                </AccessLevelOption>
                                <AccessLevelOption selected={accessLevel === 'full_access'}>
                                  <input
                                    type="radio"
                                    name={`access-${permission.key}`}
                                    value="full_access"
                                    checked={accessLevel === 'full_access'}
                                    onChange={() => setPermissionAccess(permission.key, 'full_access')}
                                  />
                                  <span>Full Access</span>
                                </AccessLevelOption>
                              </AccessLevelGroup>
                            </PermissionAccessControl>
                          )}
                        </PermissionCard>
                      );
                    })}
                  </PermissionsSection>
                  
                  {/* Panel Member Access - Below Permissions */}
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `2px solid ${formState.hasPanelMemberAccess ? 'rgba(249, 115, 22, 0.3)' : '#e2e8f0'}`,
                      background: formState.hasPanelMemberAccess ? 'rgba(249, 115, 22, 0.05)' : 'white',
                      transition: 'all 0.2s ease'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.625rem', 
                        color: '#1e293b', 
                        cursor: 'pointer', 
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        <input
                          type="checkbox"
                          checked={!!formState.hasPanelMemberAccess}
                          onChange={(event) =>
                            setFormState((prev) => ({ ...prev, hasPanelMemberAccess: event.target.checked }))
                          }
                          style={{ 
                            cursor: 'pointer', 
                            width: '18px', 
                            height: '18px',
                            accentColor: '#f97316'
                          }}
                        />
                        <span>Grant Panel Member Access</span>
                      </label>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        marginTop: '0.25rem',
                        marginLeft: '1.75rem',
                        lineHeight: '1.4'
                      }}>
                        Allows access to panel member features with same credentials
                      </div>
                    </div>
                  </div>
                </SectionWrapper>
              </SectionsContainer>

              <ButtonRow>
                <CancelButton type="button" onClick={closeModal}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingSubAdmin ? 'Update Sub Admin' : 'Create Sub Admin'}
                </SubmitButton>
              </ButtonRow>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* ─── HRMS Employee Search Modal ─────────────────────────────────────── */}
      {showHrmsModal && (
        <Modal onClick={(e) => { if (e.target === e.currentTarget) closeHrmsModal(); }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 25px 60px rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            margin: 'auto',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>🏢</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Search HRMS Employee</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Search by Employee ID or Name</p>
                </div>
              </div>
              <button
                onClick={closeHrmsModal}
                style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >&times;</button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1rem', color: '#94a3b8', pointerEvents: 'none', zIndex: 1
              }}>🔍</div>
              <input
                autoFocus
                type="text"
                placeholder="Type employee ID or name..."
                value={hrmsQuery}
                onChange={handleHrmsQueryChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
              {hrmsSearching && (
                <div style={{
                  position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  width: '18px', height: '18px',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #7c3aed',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              )}
            </div>

            <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>

            {/* Hint */}
            {hrmsQuery.trim().length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: '#94a3b8', fontSize: '0.875rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                Start typing to search employees from HRMS database
              </div>
            )}

            {/* Error */}
            {hrmsError && !hrmsSearching && (
              <div style={{
                padding: '0.875rem 1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>{hrmsError}</div>
            )}

            {/* Results List */}
            {hrmsResults.length > 0 && (
              <div style={
                {
                  overflowY: 'auto',
                  maxHeight: '340px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  paddingRight: '0.25rem'
                }
              }>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {hrmsResults.length} result{hrmsResults.length !== 1 ? 's' : ''} found
                </p>
                {hrmsResults.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => selectHrmsEmployee(emp)}
                    style={{
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#7c3aed';
                      e.currentTarget.style.background = '#faf5ff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '42px', height: '42px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7c3aed22, #6d28d933)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: '#7c3aed'
                    }}>
                      {emp.employee_name ? emp.employee_name.charAt(0).toUpperCase() : '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.employee_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.35rem 0.75rem', alignItems: 'center' }}>
                        <span>🆔 {emp.emp_no}</span>
                        {emp.email && <span>📧 {emp.email}</span>}
                        {emp.designation && <span>💼 {emp.designation}</span>}
                        {emp.division && <span>🏛️ {emp.division}</span>}
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          🔒 HRMS Account
                        </span>
                      </div>
                    </div>

                    {/* Select arrow */}
                    <div style={{ color: '#7c3aed', fontSize: '1.1rem', flexShrink: 0 }}>→</div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={closeHrmsModal}
                style={{
                  width: '100%', padding: '0.65rem',
                  border: '2px solid #e2e8f0', borderRadius: '8px',
                  background: 'white', color: '#475569',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                }}
              >Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Permissions View Modal */}
      {showPermissionsModal && viewingPermissions && (
        <Modal>
          <ModalContent style={{ maxWidth: '600px' }}>
            <ModalHeader>
              <ModalTitle>Permissions - {viewingPermissions.name}</ModalTitle>
              <CloseButton onClick={() => {
                setShowPermissionsModal(false);
                setViewingPermissions(null);
              }}>&times;</CloseButton>
            </ModalHeader>
            
            <div style={{ marginTop: '1rem' }}>
              {(() => {
                let permissionsList = [];
                if (Array.isArray(viewingPermissions.permissions)) {
                  permissionsList = viewingPermissions.permissions.map(key => ({
                    key,
                    accessLevel: 'full_access'
                  }));
                } else if (typeof viewingPermissions.permissions === 'object' && viewingPermissions.permissions !== null) {
                  permissionsList = Object.entries(viewingPermissions.permissions).map(([key, accessLevel]) => ({
                    key,
                    accessLevel
                  }));
                }
                
                return permissionsList.length > 0 ? (
                  <PermissionList style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {permissionsList.map(({ key, accessLevel }) => (
                      <li key={key} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{permissionDetails[key]?.label || key}</span>
                          <span style={{ 
                            fontSize: '0.8rem',
                            color: accessLevel === 'full_access' ? '#059669' : '#f59e0b',
                            fontWeight: 600,
                            padding: '0.25rem 0.5rem',
                            background: accessLevel === 'full_access' ? '#d1fae5' : '#fef3c7',
                            borderRadius: '4px'
                          }}>
                            {accessLevel === 'full_access' ? 'Full Access' : 'View Only'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </PermissionList>
                ) : (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: '#94a3b8',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No permissions assigned</p>
                  </div>
                );
              })()}
            </div>

            <ButtonRow>
              <CancelButton type="button" onClick={() => {
                setShowPermissionsModal(false);
                setViewingPermissions(null);
              }}>
                Close
              </CancelButton>
            </ButtonRow>
          </ModalContent>
        </Modal>
      )}

      <ToastNotificationContainer 
        toast={toast} 
        onClose={() => setToast({ type: '', message: '' })} 
      />
    </Container>
  );
};

export default SubAdminManagement;

