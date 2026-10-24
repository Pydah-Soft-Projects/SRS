import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaUserTie,
  FaFileAlt,
  FaUsers,
  FaClipboardList,
  FaCalendarAlt,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaUser,
  FaHome,
  FaUserShield,
  FaCog,
  FaComments
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import pydahLogoIcon from '../Pydah_logo_whitebg.avif';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => props.$isOpen ? '264px' : '64px'};
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 60%, #fff7ed 100%);
  color: #1f2937;
  border-right: 1px solid #fed7aa;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1);
  z-index: 1000;
  box-shadow: 4px 0 24px rgba(185, 28, 28, 0.08);
  overflow: hidden;
  overflow-x: hidden;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: ${props => props.$isOpen ? '280px' : '0px'};
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.$isOpen ? '4px 0 24px rgba(185, 28, 28, 0.2)' : 'none'};
  }

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: #ffedd5; }
  &::-webkit-scrollbar-thumb { background: #f97316; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #ea580c; }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.$isOpen ? '1.1rem 1.25rem' : '0.875rem 0'};
  border-bottom: 1px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'space-between' : 'center'};
  background: linear-gradient(135deg, #ffedd5 0%, #fecaca 100%);
  transition: padding 0.3s ease;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 64px;

  @media (max-width: 768px) {
    padding: ${props => props.$isOpen ? '1rem' : '0.75rem 0'};
    min-height: 56px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};
  gap: ${props => props.$isOpen ? '0.75rem' : '0'};
  width: ${props => props.$isOpen ? 'auto' : '100%'};
  max-width: 100%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  overflow: hidden;
  opacity: 1;
  pointer-events: auto;
  cursor: ${props => props.$isOpen ? 'default' : 'pointer'};

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const LogoImg = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 6px;
  filter: drop-shadow(0 2px 5px rgba(185, 28, 28, 0.25));
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(1.08);
  }
`;

const LogoText = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  white-space: nowrap;
  opacity: ${props => props.$isOpen ? 1 : 0};
  width: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  background: linear-gradient(135deg, #b91c1c 0%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
`;

const ToggleButton = styled.button`
  background: #ffffff;
  border: 1px solid #f97316;
  color: #b91c1c;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.45rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.15);

  &:hover {
    background: #b91c1c;
    color: #ffffff;
    border-color: #b91c1c;
  }

  @media (max-width: 768px) { width: 34px; height: 34px; }
  @media (max-width: 480px) { width: 34px; height: 34px; }
`;

const SidebarContent = styled.div`
  padding: 1rem 0;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${props => props.$isOpen ? '0 0.75rem' : '0 0.375rem'};
  overflow-y: auto;
  overflow-x: hidden;
  transition: padding 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: ${props => props.$isOpen ? '0 0.625rem' : '0 0.375rem'};
  }

  @media (max-width: 480px) {
    padding: ${props => props.$isOpen ? '0 0.625rem' : '0 0.375rem'};
  }
`;

const NavSection = styled.div`
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h6`
  font-size: 0.68rem;
  font-weight: 800;
  color: #9a3412;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.4rem;
  padding: 0 0.875rem;
  opacity: ${props => props.$isOpen ? 1 : 0};
  height: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.3s ease;
`;

const Divider = styled.div`
  height: 1px;
  background: #fed7aa;
  margin: 0.625rem 0.875rem;
  transition: margin 0.3s ease;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

const NavItem = styled.li`
  margin-bottom: 0.25rem;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;

  &:hover {
    transform: ${props => props.$isOpen ? 'translateX(2px)' : 'none'};
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isOpen ? 'flex-start' : 'center'};
  padding: ${props => props.$isOpen ? '0.7rem 0.875rem' : '0.7rem 0'};
  color: #1f2937;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-weight: 600;
  font-size: 0.875rem;

  &:hover {
    background: #ffffff;
    color: #b91c1c;
    box-shadow: 0 2px 8px rgba(185, 28, 28, 0.12);
  }

  &.active {
    background: linear-gradient(135deg, #b91c1c 0%, #ea580c 100%);
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(185, 28, 28, 0.35);
  }

  svg {
    font-size: 0.95rem;
    margin-right: ${props => props.$isOpen ? '0.7rem' : '0'};
    min-width: 16px;
    width: ${props => props.$isOpen ? 'auto' : '16px'};
    height: ${props => props.$isOpen ? 'auto' : '16px'};
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: #c2410c;
  }

  &:hover svg { color: #b91c1c; }
  &.active svg { color: #ffffff; }
`;

const NavText = styled.span`
  opacity: ${props => props.$isOpen ? 1 : 0};
  width: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  white-space: nowrap;
  font-weight: 500;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  margin: 0;
`;

const Tooltip = styled.div`
  position: fixed;
  left: ${props => props.$left ? `${props.$left}px` : '74px'};
  top: ${props => props.$top ? `${props.$top}px` : '50%'};
  transform: translateY(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  visibility: ${props => props.$show ? 'visible' : 'hidden'};

  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: #1f2937;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserSection = styled.div`
  border-top: 1px solid #fed7aa;
  padding: ${props => props.$isOpen ? '0.75rem' : '0.5rem 0.25rem'};
  background: linear-gradient(180deg, #ffedd5 0%, #fff7ed 100%);
  transition: padding 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.$isOpen ? '0.5rem' : '0'};
  margin-bottom: 0;
  padding: ${props => props.$isOpen ? '0.6rem 0.7rem' : '0'};
  border-radius: 10px;
  background: ${props => props.$isOpen ? '#ffffff' : 'transparent'};
  border: ${props => props.$isOpen ? '1px solid #fed7aa' : 'none'};
  box-shadow: ${props => props.$isOpen ? '0 2px 8px rgba(185, 28, 28, 0.06)' : 'none'};
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: ${props => props.$isOpen ? 'visible' : 'hidden'};
  opacity: ${props => props.$isOpen ? 1 : 0};

  &:hover {
    background: ${props => props.$isOpen ? '#ffffff' : 'transparent'};
    box-shadow: ${props => props.$isOpen ? '0 4px 12px rgba(185, 28, 28, 0.12)' : 'none'};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b91c1c 0%, #ea580c 100%);
  border: 2px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 9px;
    height: 9px;
    background: #10b981;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const UserDetails = styled.div`
  opacity: ${props => props.$isOpen ? 1 : 0};
  width: ${props => props.$isOpen ? 'auto' : '0'};
  overflow: hidden;
  transition: opacity 0.3s ease, width 0.3s ease;
  flex: 1;
  min-width: 0;
  margin-left: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.82rem;
  margin-bottom: 0.1rem;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.7rem;
  color: #c2410c;
  text-transform: capitalize;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
  box-sizing: border-box;

  &:hover {
    background: #fee2e2;
    color: #991b1b;
    border-color: #fca5a5;
    transform: scale(1.08);
  }

  svg {
    font-size: 0.9rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
    color: #dc2626;
  }

  &:hover svg {
    color: #991b1b;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.$isOpen && props.$showOnMobile ? 'block' : 'none'};
  backdrop-filter: blur(4px);

  @media (min-width: 768px) {
    display: none;
  }
`;

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [notifications, setNotifications] = useState({ feedback: 0, interviews: 0 });
  const [dashboardCounts, setDashboardCounts] = useState({
    pendingApprovals: 0,
    upcomingInterviews: 0,
    newSubmissions: 0,
    activeForms: 0
  });
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (user?.role === 'panel_member') {
      fetchNotifications();
    } else if (user?.role === 'super_admin' || user?.role === 'sub_admin') {
      fetchDashboardCounts();
      // Periodically refresh counts every 60 seconds without re-hammering the server on each section click
      const interval = setInterval(fetchDashboardCounts, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch notifications when super_admin or sub_admin switches into panel member area
  useEffect(() => {
    if ((user?.role === 'super_admin' || (user?.role === 'sub_admin' && user?.hasPanelMemberAccess)) && location.pathname.startsWith('/panel-member')) {
      fetchNotifications();
    }
  }, [location.pathname, user]);

  const fetchNotifications = async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    try {
      const response = await api.get('/interviews/panel-member/notifications');
      setNotifications(response.data);
    } catch (error) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      console.warn('Could not fetch notifications:', error?.message || error);
    }
  };

  const fetchDashboardCounts = async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    try {
      const [formsRes, candidatesRes, interviewsRes] = await Promise.allSettled([
        api.get('/forms'),
        api.get('/candidates'),
        api.get('/interviews')
      ]);

      const forms = formsRes.status === 'fulfilled' ? formsRes.value.data?.forms || [] : [];
      const candidates = candidatesRes.status === 'fulfilled' ? candidatesRes.value.data?.candidates || [] : [];
      const interviews = interviewsRes.status === 'fulfilled' ? interviewsRes.value.data?.interviews || [] : [];

      // Calculate counts
      const candidateForms = forms.filter(f => f.formType === 'candidate_profile');
      const activeForms = candidateForms.filter(f => f.isActive !== false).length;
      const pendingApprovals = candidates.filter(c => c.status === 'pending' || c.status === 'application_review').length;
      
      const now = new Date();
      const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const upcomingInterviews = interviews.filter(i => {
        if (!i.scheduledDate) return false;
        const scheduled = new Date(i.scheduledDate);
        return scheduled >= now && scheduled <= fourteenDaysFromNow;
      }).length;

      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newSubmissions = candidates.filter(c => {
        if (!c.createdAt) return false;
        return new Date(c.createdAt) >= sevenDaysAgo;
      }).length;

      setDashboardCounts({
        pendingApprovals,
        upcomingInterviews,
        newSubmissions,
        activeForms
      });
    } catch (error) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      console.warn('Could not fetch dashboard counts:', error?.message || error);
    }
  };

  const handleLogout = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
    logout();
    navigate('/login');
  };

  const navigationItems = {
    super_admin: [
      { path: '/super-admin', icon: FaUserTie, label: 'Dashboard' },
      { path: '/super-admin/creation', icon: FaFileAlt, label: 'Candidate Application', badge: dashboardCounts.activeForms },
      { path: '/super-admin/submissions', icon: FaFileAlt, label: 'Application Submissions', badge: dashboardCounts.pendingApprovals },
      { path: '/super-admin/tests', icon: FaClipboardList, label: 'Test Management' },
      { path: '/super-admin/users', icon: FaUserTie, label: 'Panel Members' },
      { path: '/super-admin/sub-admins', icon: FaUserShield, label: 'User Management' },
      { path: '/super-admin/courses', icon: FaCog, label: 'Campus Management' },
      { path: '/super-admin/interviews', icon: FaCalendarAlt, label: 'Interview Management', badge: dashboardCounts.upcomingInterviews },
      { path: '/super-admin/candidates', icon: FaUsers, label: 'Candidate Management', badge: dashboardCounts.newSubmissions },
      { path: '/super-admin/settings', icon: FaCog, label: 'Notifications' },
      { path: '/panel-member/feedback', icon: FaComments, label: 'Panel Member View', divider: true },
    ],
    panel_member: [
      { path: '/panel-member', icon: FaHome, label: 'Dashboard' },
      { path: '/panel-member/interviews', icon: FaCalendarAlt, label: 'My Interviews', badge: notifications.interviews },
      { path: '/panel-member/reports', icon: FaChartBar, label: 'Reports & Analytics' },
      { path: '/panel-member/profile', icon: FaUser, label: 'Profile Settings' },
    ],
    candidate: [
      { path: '/candidate', icon: FaUserTie, label: 'Dashboard' },
      { path: '/candidate/profile', icon: FaUser, label: 'My Profile' },
      { path: '/candidate/tests', icon: FaClipboardList, label: 'My Tests' },
    ]
  };

  const subAdminNavigation = [
    { path: '/sub-admin', icon: FaHome, label: 'Dashboard' },
    { path: '/sub-admin/forms', icon: FaFileAlt, label: 'Forms & Applications', permission: 'forms.manage', badge: dashboardCounts.activeForms },
    { path: '/sub-admin/submissions', icon: FaFileAlt, label: 'Application Submissions', permission: 'forms.manage', badge: dashboardCounts.pendingApprovals },
    { path: '/sub-admin/candidates', icon: FaUsers, label: 'Candidate Management', permission: 'candidates.manage', badge: dashboardCounts.newSubmissions },
    { path: '/sub-admin/tests', icon: FaClipboardList, label: 'Test Management', permission: 'tests.manage' },
    { path: '/sub-admin/interviews', icon: FaCalendarAlt, label: 'Interview Management', permission: 'interviews.manage', badge: dashboardCounts.upcomingInterviews },
    { path: '/sub-admin/users', icon: FaUserTie, label: 'Panel Members', permission: 'panel_members.manage' },
  ];

  let currentNavItems = navigationItems[user?.role] || [];

  if (user?.role === 'sub_admin') {
    currentNavItems = subAdminNavigation.filter(item => !item.permission || hasPermission(item.permission));
  }

  // If super_admin or sub_admin with panel access is viewing panel member pages, show panel member navigation
  if ((user?.role === 'super_admin' || (user?.role === 'sub_admin' && user?.hasPanelMemberAccess)) && location.pathname.startsWith('/panel-member')) {
    currentNavItems = [
      ...navigationItems.panel_member,
      { path: user?.role === 'super_admin' ? '/super-admin' : '/sub-admin', icon: FaUserShield, label: `Back to ${user?.role === 'super_admin' ? 'Admin' : 'Sub Admin'} View`, divider: true }
    ];
  }

  const formatUserRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Overlay $isOpen={isOpen} $showOnMobile={true} onClick={toggleSidebar} />
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader $isOpen={isOpen}>
          <Logo $isOpen={isOpen} onClick={!isOpen ? toggleSidebar : undefined} title={!isOpen ? "Expand sidebar" : "Pydah Staff Recruitment"}>
            <LogoImg 
              src={pydahLogoIcon || (process.env.PUBLIC_URL + '/Pydah_logo_whitebg.avif')} 
              alt="Pydah Logo" 
              onError={(e) => { e.target.src = process.env.PUBLIC_URL + '/Pydah_logo_whitebg.avif'; }}
            />
            <LogoText $isOpen={isOpen}>SRS</LogoText>
          </Logo>
          {isOpen && (
            <ToggleButton onClick={toggleSidebar} $isOpen={isOpen} title="Collapse sidebar">
              <FaBars />
            </ToggleButton>
          )}
        </SidebarHeader>

        <SidebarContent>
          <Navigation $isOpen={isOpen}>
            <NavSection>
              <SectionTitle $isOpen={isOpen}>Navigation</SectionTitle>
              <NavList>
                {currentNavItems.map((item, index) => (
                  <React.Fragment key={item.path}>
                    {item.divider && index > 0 && <Divider $isOpen={isOpen} />}
                    <NavItem $isOpen={isOpen}>
                      <NavLink
                        to={item.path}
                        className={location.pathname === item.path || (item.path === '/panel-member/feedback' && location.pathname.startsWith('/panel-member')) ? 'active' : ''}
                        $isOpen={isOpen}
                        onClick={() => {
                          if (isMobile && isOpen) {
                            toggleSidebar();
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!isOpen) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredItem({
                              id: item.path,
                              top: rect.top + rect.height / 2,
                              left: rect.right + 10,
                              label: item.label
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <item.icon />
                        <NavText $isOpen={isOpen}>{item.label}</NavText>
                      </NavLink>
                    </NavItem>
                  </React.Fragment>
                ))}
              </NavList>
            </NavSection>
          </Navigation>

          <UserSection $isOpen={isOpen}>
            {isOpen ? (
              <UserInfo $isOpen={isOpen}>
                <UserAvatar $isOpen={isOpen}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </UserAvatar>
                <UserDetails $isOpen={isOpen}>
                  <UserName title={user?.name}>{user?.name || 'User'}</UserName>
                  <UserRole>
                    <FaUserTie style={{ fontSize: '0.7rem' }} />
                    {formatUserRole(user?.role || 'User')}
                  </UserRole>
                </UserDetails>
                <LogoutButton 
                  onClick={handleLogout} 
                  title="Logout"
                  aria-label="Logout"
                >
                  <FaSignOutAlt />
                </LogoutButton>
              </UserInfo>
            ) : (
              <LogoutButton 
                onClick={handleLogout} 
                title="Logout"
                aria-label="Logout"
                style={{ width: '36px', height: '36px', margin: '0 auto' }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({
                    id: 'logout',
                    top: rect.top + rect.height / 2,
                    left: rect.right + 10,
                    label: 'Logout'
                  });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <FaSignOutAlt />
              </LogoutButton>
            )}
          </UserSection>
        </SidebarContent>

        {!isOpen && hoveredItem && (
          <Tooltip 
            $show={!!hoveredItem}
            $top={hoveredItem.top}
            $left={hoveredItem.left}
          >
            {hoveredItem.label}
          </Tooltip>
        )}
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
