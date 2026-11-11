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

  const navigationItems = {
    super_admin: [
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
      { path: '/panel-member/feedback', icon: MessageSquare, label: 'Panel Member View', divider: true },
    ],
    panel_member: [
      { path: '/panel-member', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/panel-member/interviews', icon: Calendar, label: 'My Interviews' },
      { path: '/panel-member/reports', icon: BarChart3, label: 'Reports & Analytics' },
      { path: '/panel-member/profile', icon: User, label: 'Profile Settings' },
    ],
    candidate: [
      { path: '/candidate', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/candidate/profile', icon: User, label: 'My Profile' },
      { path: '/candidate/tests', icon: ClipboardList, label: 'My Tests' },
    ],
  };

  const subAdminNavigation = [
    { path: '/sub-admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/sub-admin/forms', icon: FileText, label: 'Forms & Applications', permission: 'forms.manage' },
    { path: '/sub-admin/submissions', icon: Inbox, label: 'Application Submissions', permission: 'forms.manage' },
    { path: '/sub-admin/candidates', icon: Users, label: 'Candidate Management', permission: 'candidates.manage' },
    { path: '/sub-admin/tests', icon: ClipboardList, label: 'Test Management', permission: 'tests.manage' },
    { path: '/sub-admin/interviews', icon: Calendar, label: 'Interview Management', permission: 'interviews.manage' },
    { path: '/sub-admin/users', icon: Users, label: 'Panel Members', permission: 'panel_members.manage' },
  ];

  let currentNavItems = navigationItems[user?.role] || [];

  if (user?.role === 'sub_admin') {
    currentNavItems = subAdminNavigation.filter(
      (item) => !item.permission || hasPermission(item.permission)
    );
  }

  // If super_admin or sub_admin with panel access is viewing panel member pages, show panel member navigation
  if (
    (user?.role === 'super_admin' || (user?.role === 'sub_admin' && user?.hasPanelMemberAccess)) &&
    location.pathname.startsWith('/panel-member')
  ) {
    currentNavItems = [
      ...navigationItems.panel_member,
      {
        path: user?.role === 'super_admin' ? '/super-admin' : '/sub-admin',
        icon: ArrowLeft,
        label: `Back to ${user?.role === 'super_admin' ? 'Admin' : 'Sub Admin'} View`,
        divider: true,
      },
    ];
  }

  const formatUserRole = (role) => {
    return role ? role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'User';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 transition-opacity backdrop-blur-sm bg-black/50"
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

      {/* Standardized Campo Portal Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 border-r flex flex-col transition-all duration-300 ease-in-out campo-sidebar ${
          isOpen ? 'w-64 campo-sidebar-expanded' : 'w-20 campo-sidebar-collapsed'
        } ${
          isMobile
            ? isOpen
              ? 'translate-x-0 shadow-2xl'
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
          backgroundColor: 'var(--sidebar)',
          color: 'var(--sidebar-text)',
          borderColor: 'var(--border)',
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
      >
        {/* Floating Circular Collapse Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-[106px] z-50 w-6 h-6 rounded-full shadow-md border flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none campo-sidebar-toggle-btn"
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
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: 'var(--primary)',
          }}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? (
            <ChevronLeft size={14} className="stroke-[2.5]" style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
          ) : (
            <ChevronRight size={14} className="stroke-[2.5]" style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
          )}
        </button>

        {/* Top Header */}
        <div
          className="flex flex-col items-center justify-center text-center pt-6 pb-4 border-b relative campo-sidebar-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            paddingTop: '1.5rem',
            paddingBottom: '1rem',
            borderColor: 'var(--border)',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            width: '100%',
            boxSizing: 'border-box',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Link
            to={getDefaultRoute()}
            className="flex flex-col items-center justify-center no-underline"
            style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            title="Campo - Staff Recruitment"
          >
            <img
              src="/campo-logos/campo_logo_transparent_hq.png"
              alt="Campo Logo"
              className="h-7 object-contain mx-auto transition-all duration-300"
              style={{
                height: '1.75rem',
                objectFit: 'contain',
                margin: '0 auto',
                maxWidth: isOpen ? '120px' : '44px',
              }}
            />
            {isOpen && (
              <span
                className="text-[11px] font-semibold tracking-wider uppercase mt-1.5 whitespace-nowrap transition-opacity duration-300"
                style={{
                  color: 'var(--sidebar-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: '0.375rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Staff Recruitment
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Content */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden space-y-1 select-none campo-sidebar-nav ${
            isOpen ? 'px-3 py-4' : 'px-2 py-4 campo-sidebar-nav-collapsed'
          }`}
          style={{
            flex: '1 1 0%',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: isOpen ? '1rem 0.75rem' : '1rem 0.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {isOpen && (
            <div
              className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase"
              style={{
                color: 'var(--sidebar-muted)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingBottom: '0.5rem',
              }}
            >
              Navigation
            </div>
          )}

          <ul
            className="space-y-1 list-none p-0 m-0"
            style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            {currentNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/panel-member/feedback' &&
                  location.pathname.startsWith('/panel-member'));

              return (
                <React.Fragment key={item.path}>
                  {item.divider && index > 0 && (
                    <li
                      className="my-2 border-t list-none"
                      style={{
                        borderColor: 'var(--border)',
                        borderTopWidth: '1px',
                        borderTopStyle: 'solid',
                        margin: '0.5rem 0',
                        listStyle: 'none',
                      }}
                    />
                  )}
                  <li className="relative list-none" style={{ listStyle: 'none', position: 'relative' }}>
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
                      className={`campo-sidebar-nav-item flex items-center rounded-lg text-sm transition-all duration-150 no-underline ${
                        isOpen ? 'px-3 py-2.5 gap-3' : 'px-0 py-2.5 justify-center'
                      } ${isActive ? 'active font-semibold shadow-sm' : 'font-medium'}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        gap: isOpen ? '0.75rem' : '0',
                        padding: isOpen ? '0.625rem 0.75rem' : '0.625rem 0',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 500,
                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-text)',
                        boxSizing: 'border-box',
                        width: '100%',
                      }}
                    >
                      <Icon
                        size={18}
                        className="shrink-0 transition-colors"
                        style={{
                          color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-muted)',
                          flexShrink: 0,
                        }}
                      />
                      {isOpen && (
                        <span
                          className="truncate whitespace-nowrap leading-none"
                          style={{
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
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        {/* User / Authentication Footer Section */}
        <div
          className="border-t shrink-0 campo-sidebar-footer"
          style={{
            borderColor: 'var(--border)',
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            backgroundColor: 'var(--sidebar)',
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {isOpen ? (
            <div style={{ padding: '0.75rem', boxSizing: 'border-box', width: '100%' }}>
              <div
                className="flex items-center gap-2.5 p-2 rounded-xl border transition-all"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-light)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                    flexShrink: 0,
                    backgroundColor: 'var(--primary)',
                    color: 'var(--sidebar-text)',
                    borderColor: 'var(--border)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                  <div
                    className="text-xs font-semibold truncate leading-tight"
                    style={{
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.25,
                    }}
                    title={user?.name}
                  >
                    {user?.name || 'User'}
                  </div>
                  <div
                    className="text-[11px] truncate capitalize leading-tight mt-0.5"
                    style={{
                      color: 'var(--sidebar-muted)',
                      fontSize: '11px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textTransform: 'capitalize',
                      lineHeight: 1.25,
                      marginTop: '2px',
                    }}
                  >
                    {formatUserRole(user?.role || 'User')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: 'var(--danger)',
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '0.75rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="w-10 h-10 rounded-lg border flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  color: 'var(--danger)',
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({
                    id: 'logout',
                    top: rect.top + rect.height / 2,
                    label: 'Logout',
                  });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Hover Tooltip in Collapsed State */}
        {!isOpen && hoveredItem && (
          <div
            className="fixed z-50 px-3 py-1.5 text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap border"
            style={{
              position: 'fixed',
              left: '88px',
              top: hoveredItem.top,
              transform: 'translateY(-50%)',
              zIndex: 50,
              padding: '0.375rem 0.75rem',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              backgroundColor: 'var(--surface)',
              color: 'var(--primary)',
              borderColor: 'var(--border)',
              borderWidth: '1px',
              borderStyle: 'solid',
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
