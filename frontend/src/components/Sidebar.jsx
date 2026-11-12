import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  ClipboardList,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  Settings,
  MessageSquare,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
    logout();
    navigate('/login');
  };

  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'super_admin':
        return '/super-admin';
      case 'sub_admin':
        return '/sub-admin';
      case 'panel_member':
        return '/panel-member';
      case 'candidate':
        return '/candidate';
      default:
        return '/';
    }
  };

  // Structured sections preserving existing labels, routes, icons, and order
  const navigationSections = {
    super_admin: [
      {
        title: 'Navigation',
        items: [
          { path: '/super-admin', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/super-admin/creation', icon: FileText, label: 'Candidate Application' },
          { path: '/super-admin/submissions', icon: Inbox, label: 'Application Submissions' },
          { path: '/super-admin/tests', icon: ClipboardList, label: 'Test Management' },
          { path: '/super-admin/users', icon: Users, label: 'Panel Members' },
          { path: '/super-admin/sub-admins', icon: ShieldCheck, label: 'User Management' },
          { path: '/super-admin/courses', icon: Building2, label: 'Campus Management' },
          { path: '/super-admin/interviews', icon: Calendar, label: 'Interview Management' },
          { path: '/super-admin/candidates', icon: Users, label: 'Candidate Management' },
          { path: '/super-admin/settings', icon: Settings, label: 'Notifications' },
        ],
      },
      {
        title: 'Views',
        items: [
          { path: '/panel-member/feedback', icon: MessageSquare, label: 'Panel Member View' },
        ],
      },
    ],
    panel_member: [
      {
        title: 'Navigation',
        items: [
          { path: '/panel-member', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/panel-member/interviews', icon: Calendar, label: 'My Interviews' },
          { path: '/panel-member/reports', icon: BarChart3, label: 'Reports & Analytics' },
          { path: '/panel-member/profile', icon: User, label: 'Profile Settings' },
        ],
      },
    ],
    candidate: [
      {
        title: 'Navigation',
        items: [
          { path: '/candidate', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/candidate/profile', icon: User, label: 'My Profile' },
          { path: '/candidate/tests', icon: ClipboardList, label: 'My Tests' },
        ],
      },
    ],
    sub_admin: [
      {
        title: 'Navigation',
        items: [
          { path: '/sub-admin', icon: LayoutDashboard, label: 'Dashboard' },
          { path: '/sub-admin/forms', icon: FileText, label: 'Forms & Applications', permission: 'forms.manage' },
          { path: '/sub-admin/submissions', icon: Inbox, label: 'Application Submissions', permission: 'forms.manage' },
          { path: '/sub-admin/candidates', icon: Users, label: 'Candidate Management', permission: 'candidates.manage' },
          { path: '/sub-admin/tests', icon: ClipboardList, label: 'Test Management', permission: 'tests.manage' },
          { path: '/sub-admin/interviews', icon: Calendar, label: 'Interview Management', permission: 'interviews.manage' },
          { path: '/sub-admin/users', icon: Users, label: 'Panel Members', permission: 'panel_members.manage' },
        ],
      },
    ],
  };

  let rawSections = navigationSections[user?.role] || [];

  // Filter items by role-based permission for sub_admin
  if (user?.role === 'sub_admin') {
    rawSections = rawSections.map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }));
  }

  // Switch to panel member navigation when super_admin or sub_admin is on panel member route
  if (
    (user?.role === 'super_admin' || (user?.role === 'sub_admin' && user?.hasPanelMemberAccess)) &&
    location.pathname.startsWith('/panel-member')
  ) {
    rawSections = [
      {
        title: 'Panel Member',
        items: navigationSections.panel_member[0].items,
      },
      {
        title: 'Views',
        items: [
          {
            path: user?.role === 'super_admin' ? '/super-admin' : '/sub-admin',
            icon: ArrowLeft,
            label: `Back to ${user?.role === 'super_admin' ? 'Admin' : 'Sub Admin'} View`,
          },
        ],
      },
    ];
  }

  // Do not display sections that have no permitted navigation items
  const activeSections = rawSections.filter((section) => section.items && section.items.length > 0);

  const formatUserRole = (role) => {
    return role ? role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Superadmin';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 transition-opacity backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Standardized Campo Portal Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col campo-sidebar ${
          isOpen ? 'w-64 campo-sidebar-expanded' : 'w-20 campo-sidebar-collapsed'
        } ${
          isMobile
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          width: isOpen ? '256px' : '80px',
          minWidth: isOpen ? '256px' : '80px',
          maxWidth: isOpen ? '256px' : '80px',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--sidebar, #1E3150)',
          color: 'var(--sidebar-text, #FFFFFF)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px -2px rgba(10, 20, 35, 0.45)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        {/* Floating Circular Collapse Control */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="campo-sidebar-toggle-btn focus:outline-none"
          style={{
            position: 'absolute',
            right: '-12px',
            top: '106px',
            zIndex: 50,
            width: '24px',
            height: '24px',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            cursor: 'pointer',
            backgroundColor: 'var(--surface, #FFFFFF)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            color: 'var(--primary)',
            transition: 'transform 150ms ease',
          }}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft size={14} strokeWidth={2.5} style={{ color: 'var(--primary)' }} />
          ) : (
            <ChevronRight size={14} strokeWidth={2.5} style={{ color: 'var(--primary)' }} />
          )}
        </button>

        {/* Brand Header */}
        <div
          className={`campo-sidebar-header ${
            isOpen ? 'campo-sidebar-header-expanded' : 'campo-sidebar-header-collapsed'
          }`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: isOpen ? '24px 24px 16px 24px' : '24px 8px 16px 8px',
            borderBottom: '1px solid var(--border)',
            width: '100%',
            boxSizing: 'border-box',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Link
            to={getDefaultRoute()}
            className="flex flex-col items-center justify-center no-underline"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Campo - Staff Recruitment"
          >
            {isOpen ? (
              <>
                <img
                  src="/campo-logos/campo_logo_transparent_hq.png"
                  alt="Campo Logo"
                  style={{
                    height: '28px',
                    maxWidth: '120px',
                    objectFit: 'contain',
                    margin: '0 auto',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--sidebar-muted, #AABBD4)',
                    marginTop: '8px',
                    whiteSpace: 'nowrap',
                    letterSpacing: 'normal',
                    lineHeight: 1.2,
                  }}
                >
                  Staff Recruitment
                </span>
              </>
            ) : (
              <img
                src="/campo-logos/favicon.svg"
                alt="Campo Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block',
                }}
              />
            )}
          </Link>
        </div>

        {/* Vertically Scrollable Navigation */}
        <nav
          className={`campo-sidebar-nav ${
            isOpen ? 'campo-sidebar-nav-expanded' : 'campo-sidebar-nav-collapsed'
          }`}
          style={{
            flex: '1 1 0%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isOpen ? '12px 14px 16px 14px' : '12px 8px 16px 8px',
            width: '100%',
            boxSizing: 'border-box',
            userSelect: 'none',
          }}
        >
          {activeSections.map((section, sectionIndex) => (
            <div
              key={section.title || sectionIndex}
              style={{
                marginBottom: sectionIndex < activeSections.length - 1 ? '24px' : '0px',
              }}
            >
              {/* Section Heading (11px, bold, uppercase, 0.06em letter spacing) */}
              {isOpen && section.title && (
                <div
                  className="campo-sidebar-section-heading"
                  style={{
                    padding: '4px 14px 8px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--sidebar-muted, #AABBD4)',
                    marginBottom: '4px',
                    lineHeight: 1.2,
                  }}
                >
                  {section.title}
                </div>
              )}

              {/* Navigation Items in Section */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === '/panel-member/feedback' &&
                      location.pathname.startsWith('/panel-member'));

                  return (
                    <li
                      key={item.path}
                      style={{ listStyle: 'none', position: 'relative', width: '100%' }}
                    >
                      <Link
                        to={item.path}
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
                              label: item.label,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`campo-sidebar-nav-item ${isActive ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isOpen ? 'flex-start' : 'center',
                          width: '100%',
                          padding: isOpen ? '10px 14px' : '10px 0',
                          gap: isOpen ? '14px' : '0px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: isActive ? 600 : 500,
                          backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                          color: 'var(--sidebar-text, #FFFFFF)',
                          boxShadow: isActive ? '0 2px 8px -1px rgba(0, 0, 0, 0.2)' : 'none',
                          boxSizing: 'border-box',
                          transition: 'all 150ms ease-in-out',
                        }}
                      >
                        <Icon
                          size={isOpen ? 18 : 20}
                          strokeWidth={2}
                          style={{
                            color: isActive
                              ? 'var(--sidebar-text, #FFFFFF)'
                              : 'var(--sidebar-muted, #AABBD4)',
                            flexShrink: 0,
                          }}
                        />
                        {isOpen && (
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: isActive ? 600 : 500,
                              color: 'var(--sidebar-text, #FFFFFF)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1,
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Anchored Bottom User Profile Card */}
        <div
          className="campo-sidebar-footer"
          style={{
            backgroundColor: 'var(--sidebar, #1E3150)',
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px',
          }}
        >
          {isOpen ? (
            <div
              className="campo-sidebar-profile-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 14px',
                height: '64px',
                minHeight: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.28)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {/* 40x40px Circular Avatar with 14px bold initial */}
              <div
                className="campo-sidebar-avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                  backgroundColor: 'var(--surface, #FFFFFF)',
                  color: 'var(--primary)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>

              {/* User Details (13px bold name, 11px regular role) */}
              <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                <div
                  style={{
                    color: 'var(--sidebar-text, #FFFFFF)',
                    fontSize: '13px',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                  }}
                  title={user?.name || 'System Superadmin'}
                >
                  {user?.name || 'System Superadmin'}
                </div>
                <div
                  style={{
                    color: 'var(--sidebar-muted, #AABBD4)',
                    fontSize: '11px',
                    fontWeight: 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                    marginTop: '2px',
                  }}
                >
                  {formatUserRole(user?.role || 'Superadmin')}
                </div>
              </div>

              {/* 16x16px LogOut Icon Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="campo-sidebar-logout-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--sidebar-text, #FFFFFF)',
                  flexShrink: 0,
                }}
              >
                <LogOut size={16} strokeWidth={2} style={{ color: 'var(--sidebar-text, #FFFFFF)' }} />
              </button>
            </div>
          ) : (
            /* Collapsed mode: Centered avatar only (logout hidden on minimize) */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <div
                className="campo-sidebar-avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                  backgroundColor: 'var(--surface, #FFFFFF)',
                  color: 'var(--primary)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                  cursor: 'pointer',
                }}
                title={`${user?.name || 'User'} (${formatUserRole(user?.role || 'Superadmin')})`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({
                    id: 'profile',
                    top: rect.top + rect.height / 2,
                    label: `${user?.name || 'User'} (${formatUserRole(user?.role || 'Superadmin')})`,
                  });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Hover Tooltip */}
        {!isOpen && hoveredItem && (
          <div
            style={{
              position: 'fixed',
              left: '88px',
              top: hoveredItem.top,
              transform: 'translateY(-50%)',
              zIndex: 50,
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '8px',
              backgroundColor: 'var(--surface, #FFFFFF)',
              color: 'var(--primary)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            }}
          >
            {hoveredItem.label}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
