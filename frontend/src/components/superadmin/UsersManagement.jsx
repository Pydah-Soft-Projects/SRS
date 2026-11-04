import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../services/api';
import { FaEdit, FaUserSlash, FaUserCheck, FaTrashAlt, FaPlus, FaTimes } from 'react-icons/fa';
import SkeletonLoader from '../SkeletonLoader';
import ToastNotificationContainer from '../ToastNotificationContainer';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2vw, 2rem);
`;

const Header = styled.div`
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

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 680px;
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-weight: 800;
  font-size: 1.75rem;
  letter-spacing: -0.02em;
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%);
  color: white;
  border: none;
  padding: 0.65rem 1.35rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.25);
  align-self: flex-start;

  @media (min-width: 768px) {
    align-self: auto;
  }

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, var(--text-secondary) 100%);
    box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.35);
    transform: translateY(-1px);
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.05);
  overflow: hidden;
`;

const TableScrollArea = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
  background: #ffffff;
`;

const Th = styled.th`
  background: var(--primary-light);
  padding: 0.8rem 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--primary-hover);
  border-bottom: 2px solid var(--border);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;

  &:hover {
    background: var(--primary-light);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 0.875rem;
  vertical-align: middle;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(127, 29, 29, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  box-shadow: 0 12px 36px rgba(var(--primary-rgb), 0.16);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border);
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--primary-hover);
  font-weight: 700;
  font-size: 1.35rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #9a3412;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--primary-light);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.45rem;
  font-size: 0.88rem;
`;

const Input = styled.input`
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 0.92rem;
  color: var(--text-primary);
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  background: #ffffff;
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;

  &:hover {
    background: var(--background);
    color: var(--text-primary);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%);
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  flex: 1;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, var(--text-secondary) 100%);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.35);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const UsersManagement = () => {
  const [panelMembers, setPanelMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [toast, setToast] = useState({ type: '', message: '' });
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    campus: '',
    name: '',
    email: '',
    password: '',
    courses: [],
    profile: {
      phone: '',
      designation: ''
    }
  });

  useEffect(() => {
    fetchPanelMembers();
    fetchCampuses();
  }, []);

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

  const fetchPanelMembers = async () => {
    try {
      const response = await api.get('/auth/panel-members');
      setPanelMembers(response.data.panelMembers);
    } catch (error) {
      console.error('Error fetching panel members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'campus') {
      // When campus changes, fetch courses for that campus and reset selected courses
      setFormData(prev => ({
        ...prev,
        campus: value,
        courses: [] // Reset courses when campus changes
      }));
      fetchCoursesForCampus(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCourseChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      courses: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean profile object - remove empty strings
      const cleanedProfile = Object.fromEntries(
        Object.entries(formData.profile).filter(([_, value]) => value !== '' && value != null)
      );

      const submitData = {
        campus: formData.campus,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'panel_member',
        courses: formData.courses && formData.courses.length > 0 ? formData.courses : undefined,
        profile: Object.keys(cleanedProfile).length > 0 ? cleanedProfile : undefined
      };

      if (editingMember) {
        // Remove password from update if it's empty
        if (!submitData.password) {
          delete submitData.password;
        }
        await api.put(`/auth/panel-members/${editingMember._id}`, submitData);
      } else {
        await api.post('/auth/register', submitData);
      }

      setShowModal(false);
      setEditingMember(null);
      resetForm();
      fetchPanelMembers();
    } catch (error) {
      console.error('Error saving panel member:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save panel member';
      setToast({ type: 'danger', message: errorMessage });
    }
  };

  const handleEdit = async (member) => {
    setEditingMember(member);
    const memberCourses = member.courses ? member.courses.map(c => typeof c === 'object' ? c._id : c) : [];
    setFormData({
      campus: member.campus || '',
      name: member.name,
      email: member.email,
      password: '',
      courses: memberCourses,
      profile: {
        phone: member.profile?.phone || '',
        designation: member.profile?.designation || ''
      }
    });
    // Fetch courses for the member's campus
    if (member.campus) {
      await fetchCoursesForCampus(member.campus);
    }
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this panel member?')) {
      try {
        await api.delete(`/auth/panel-members/${memberId}`);
        fetchPanelMembers();
      } catch (error) {
        console.error('Error deleting panel member:', error);
      }
    }
  };

  const handleStatusToggle = async (memberId, currentStatus) => {
    try {
      await api.put(`/auth/users/${memberId}/status`, { isActive: !currentStatus });
      fetchPanelMembers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      campus: '',
      name: '',
      email: '',
      password: '',
      courses: [],
      profile: {
        phone: '',
        designation: ''
      }
    });
    setCourses([]);
  };

  const openAddModal = () => {
    setEditingMember(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Panel Members Database</Title>
          <Subtitle>Step 3: Manage interview panel members for candidate evaluation.</Subtitle>
        </HeaderContent>
        <AddButton onClick={openAddModal}>
          <FaPlus size={12} /> Add Panel Member
        </AddButton>
      </Header>

      <TableWrapper>
        {loading ? (
          <div style={{ padding: '1.25rem' }}>
            <SkeletonLoader loading={true} variant="table" rows={6} columns="repeat(6, 1fr)" />
          </div>
        ) : (
          <TableScrollArea>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Campus</Th>
                  <Th>Courses</Th>
                  <Th>Designation</Th>
                  <Th>Phone</Th>
                  <Th style={{ textAlign: 'center' }}>Status</Th>
                  <Th style={{ textAlign: 'center' }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {panelMembers.length === 0 ? (
                  <tr>
                    <Td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No panel members found. Click "Add Panel Member" to add one.
                    </Td>
                  </tr>
                ) : (
                  panelMembers.map(member => (
                    <Tr key={member._id}>
                      <Td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</span>
                        {member.role === 'sub_admin' && (
                          <span style={{ 
                            marginLeft: '0.5rem',
                            padding: '0.18rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--primary-light)',
                            border: '1px solid var(--border)',
                            color: '#9a3412',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            (Sub Admin)
                          </span>
                        )}
                      </Td>
                      <Td>{member.email}</Td>
                      <Td>{member.campus || 'N/A'}</Td>
                      <Td>
                        {member.courses && member.courses.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {member.courses.map((course) => (
                              <span
                                key={typeof course === 'object' ? course._id : course}
                                style={{
                                  background: 'var(--primary-light)',
                                  color: '#9a3412',
                                  border: '1px solid var(--border)',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600
                                }}
                              >
                                {typeof course === 'object' ? course.department : 'N/A'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No courses assigned</span>
                        )}
                      </Td>
                      <Td>{member.profile?.designation || 'N/A'}</Td>
                      <Td>{member.profile?.phone || 'N/A'}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            background: member.isActive ? '#d1fae5' : 'var(--danger-light)',
                            color: member.isActive ? '#065f46' : 'var(--primary-hover)',
                            border: `1px solid ${member.isActive ? '#a7f3d0' : 'var(--danger-light)'}`,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            title="Edit Panel Member"
                            onClick={() => handleEdit(member)}
                            style={{
                              background: 'linear-gradient(135deg, var(--success) 0%, var(--success) 100%)',
                              color: 'white',
                              border: 'none',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              boxShadow: '0 2px 5px rgba(16, 185, 129, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            type="button"
                            title={member.isActive ? 'Deactivate Panel Member' : 'Activate Panel Member'}
                            onClick={() => handleStatusToggle(member._id, member.isActive)}
                            style={{
                              background: member.isActive ? 'linear-gradient(135deg, var(--warning) 0%, var(--warning) 100%)' : 'linear-gradient(135deg, var(--success) 0%, var(--success) 100%)',
                              color: 'white',
                              border: 'none',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              boxShadow: '0 2px 5px rgba(245, 158, 11, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {member.isActive ? <FaUserSlash size={13} /> : <FaUserCheck size={13} />}
                          </button>
                          <button
                            type="button"
                            title="Delete Panel Member"
                            onClick={() => handleDelete(member._id)}
                            style={{
                              background: 'linear-gradient(135deg, var(--primary) 0%, var(--danger) 100%)',
                              color: 'white',
                              border: 'none',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              boxShadow: '0 2px 5px rgba(var(--primary-rgb), 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FaTrashAlt size={13} />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </TableScrollArea>
        )}
      </TableWrapper>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingMember ? 'Edit Panel Member' : 'Add Panel Member'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)} title="Close">
                <FaTimes size={16} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="campus">Campus *</Label>
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <option value="">Select Campus</option>
                  {campuses.map(campus => (
                    <option key={campus} value={campus}>{campus}</option>
                  ))}
                </select>
              </FormGroup>

              {formData.campus && (
                <FormGroup>
                  <Label htmlFor="courses">Courses (Departments) *</Label>
                  <select
                    id="courses"
                    name="courses"
                    multiple
                    value={formData.courses}
                    onChange={handleCourseChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid var(--border-strong)',
                      borderRadius: '8px',
                      fontSize: '0.92rem',
                      color: 'var(--text-primary)',
                      minHeight: '120px',
                      outline: 'none',
                      background: '#ffffff',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>
                        {course.department}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#9a3412', fontSize: '0.8rem', marginTop: '0.35rem', display: 'block', fontWeight: 500 }}>
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple courses
                  </small>
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              {!editingMember ? (
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password to update"
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label htmlFor="profile.phone">Phone</Label>
                <Input
                  type="tel"
                  id="profile.phone"
                  name="profile.phone"
                  value={formData.profile.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="profile.designation">Designation</Label>
                <Input
                  type="text"
                  id="profile.designation"
                  name="profile.designation"
                  value={formData.profile.designation}
                  onChange={handleInputChange}
                  placeholder="e.g., Professor, HR Manager"
                />
              </FormGroup>

              <ButtonGroup>
                <CancelButton type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit">
                  {editingMember ? 'Update' : 'Create'}
                </SubmitButton>
              </ButtonGroup>
            </Form>
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

export default UsersManagement;
