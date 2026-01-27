import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  Building, Users, Bell, Shield, 
  Plus, MapPin, Pencil, Trash2, Globe, Eye, User, Mail
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ErrorModal from '../../components/common/ErrorModal';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { formatDistanceToNow } from 'date-fns';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const { token, role } = useLogin();
  const { currentUser } = useCurrentUser();
  
  const isNestedDetailPage = 
    location.pathname.includes('/settings/sites/new') ||
    location.pathname.includes('/settings/sites/edit/') ||
    location.pathname.includes('/settings/notifications/');

  const getTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/settings/sites')) return 'sites';
    if (path.includes('/settings/users')) return 'users';
    if (path.includes('/settings/notifications')) return 'notifications';
    if (path.includes('/settings/security')) return 'security';
    return 'sites';
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [sites, setSites] = useState([]);
  const [siteSearch, setSiteSearch] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, getTabFromPath]);

  useEffect(() => {
    const checkForRefetch = () => {
      if (location.state?.refetch) {
        setRefetchTrigger(prev => prev + 1);
        window.history.replaceState({}, document.title);
      }
    };
    checkForRefetch();
  }, [location.state]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/settings/${tab}`);
  };

  useEffect(() => {
    if (activeTab === 'sites') {
      const fetchSites = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/sites`,
            'GET',
            null,
            { Authorization: 'Bearer ' + token }
          ); 
          setSites(responseData.sites);
        } catch (error) {}
      };
      fetchSites();
    }
  }, [sendRequest, token, activeTab, refetchTrigger]);

  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/user/all`, 
            'GET',
            null,
            { Authorization: 'Bearer ' + token }
          );
          setUsers(responseData.users);
        } catch (error) {}
      };
      fetchUsers();
    }
  }, [sendRequest, token, activeTab, refetchTrigger]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      const fetchNotifications = async () => {
        try {
          const responseData = await sendRequest(
            `${process.env.REACT_APP_BACKEND_URL}/notifications`, 
            'GET',
            null,
            { Authorization: 'Bearer ' + token }
          );
          setNotifications(responseData.notifications);
        } catch (error) {}
      };
      fetchNotifications();
    }
  }, [sendRequest, token, activeTab, refetchTrigger]);

  const showDeleteWarningHandler = (id, name) => {
    setSiteToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setSiteToDelete(null);
  };

  const confirmDeleteHandler = async () => {
    if (!siteToDelete) return;
    if (role !== "Admin" && role !== "Supervisor") {
      alert('You are not allowed to perform this action');
      return;
    }
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/sites/${siteToDelete.id}`, 
        'DELETE',
        null,
        { Authorization: 'Bearer ' + token }
      );
      setSites(current => current.filter(item => item.id !== siteToDelete.id));
      setShowConfirmModal(false);
      setSiteToDelete(null);
    } catch (error) {}
  };

  const handleNotificationClick = (id) => {
    navigate(`/settings/notifications/${id}`);
  };

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(siteSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const renderSitesTab = () => (
    <div className="tab-content animate-fade-in">
      <div className="tab-header">
        <div>
          <h3>Site Management</h3>
          <p>Manage facility locations and assets</p>
        </div>
        {role === "Admin" || role === "Supervisor" ? (
        <Button icon={Plus} onClick={() => navigate('/settings/sites/new')}>
            Add New Site
        </Button>
        ) : null}
      </div>

      <div className="search-bar-wrapper">
        <Input 
            id="site-search"
            placeholder="Search sites..." 
            value={siteSearch}
            onChange={(e) => setSiteSearch(e.target.value)}
        />
      </div>

      <div className="sites-grid">
        {filteredSites.map(site => (
          <div key={site.id} className="site-card">
            <div className="site-card-header">
                <div className="site-icon">
                    <Globe size={20} />
                </div>
                <div className="site-actions">
                    <button className="icon-action view" onClick={() => navigate(`/sites/${site.id}`)}>
                        <Eye size={16} />
                    </button>
                    {(role === "Admin" || role === "Supervisor") && (
                      <>
                        <button className="icon-action edit" onClick={(e) => { e.stopPropagation(); navigate(`/settings/sites/edit/${site.id}`); }}>
                            <Pencil size={16} />
                        </button>
                        <button className="icon-action delete" onClick={() => showDeleteWarningHandler(site.id, site.name)}>
                            <Trash2 size={16} />
                        </button>
                      </>
                    )}
                </div>
            </div>
            <h4 className="site-name clickable" onClick={() => navigate(`/sites/${site.id}`)}>{site.name}</h4>
            <span className="site-type">{site.purpose}</span>
            <div className="site-details">
                <div className="detail-row">
                    <MapPin size={14} className="detail-icon" />
                    <span>{site.address}</span>
                </div>
                <div className="detail-row-bottom">
                    <span className="count-badge">{site.equipment?.length || 0} {site.equipment?.length === 1 ? 'Asset': 'Assets'}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="tab-content animate-fade-in">
      <div className="tab-header">
        <div>
          <h3>Users List</h3>
          <p>View the list of system users</p>
        </div>
      </div>

      <div className="search-bar-wrapper">
        <Input 
            id="user-search"
            placeholder="Search users by name or email..." 
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
        />
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card-top">
                <div className="user-avatar-circle">
                    {user.avatar ? (
                        <img src={`${process.env.REACT_APP_ASSET_URL}/${user.avatar}`} alt={user.name} />
                    ) : (
                        <User size={24} />
                    )}
                </div>
                <div className="user-role-badge">
                    {user.role}
                </div>
            </div>
            
            <div className="user-info">
                <h4 className="user-name">{user.name === currentUser?.name ? 'You' : user.name}</h4>
                <div className="user-email">
                    <Mail size={14} />
                    <span>{user.email}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="tab-content animate-fade-in">
      <div className="tab-header">
        <div>
          <h3>Notifications</h3>
          <p>Stay updated with system alerts</p>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 && <p className="no-data">No notifications yet.</p>}
        
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`notification-card ${!notif.read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notif.id)}
          >
            {!notif.read && <div className="unread-dot"></div>}
            
            <div className="notification-icon">
                <Bell size={20} />
            </div>
            <div className="notification-content">
                <div className="notif-header">
                    <h4>{notif.title}</h4>
                    <span className="notif-time">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="notif-snippet">{notif.message.substring(0, 10)}...</p>
            </div>
            <div className="notification-arrow">
                <Eye size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="tab-content animate-fade-in">
      <div className="tab-header">
        <div>
          <h3>Security & Roles</h3>
          <p>Overview of system permissions and access levels</p>
        </div>
      </div>

      <div className="security-grid">
        <div className="role-card admin">
            <div className="role-header">
                <Shield size={24} className="role-icon"/>
                <h4>Admin</h4>
            </div>
            <p className="role-desc">Full system access. Can perform all actions including managing users, sites, and system configurations.</p>
            <ul className="role-features">
                <li>Manage Users & Roles</li>
                <li>Full CRUD on Sites & Equipment</li>
                <li>View & Edit All Work Orders</li>
                <li>Access Downtime Analytics</li>
            </ul>
        </div>

        <div className="role-card supervisor">
            <div className="role-header">
                <User size={24} className="role-icon"/>
                <h4>Supervisor</h4>
            </div>
            <p className="role-desc">High-level operational access. Similar to Admin but focused on day-to-day operations.</p>
            <ul className="role-features">
                <li>Create & Edit Sites/Equipment</li>
                <li>Manage Work Orders</li>
                <li>View Downtime Reports</li>
                <li>Cannot Manage System Users</li>
            </ul>
        </div>

        <div className="role-card technician">
            <div className="role-header">
                <WrenchIcon size={24} className="role-icon"/>
                <h4>Technician</h4>
            </div>
            <p className="role-desc">Field-level access. Focused on executing assigned tasks.</p>
            <ul className="role-features">
                <li>View Assigned Work Orders</li>
                <li>Complete Work Orders</li>
                <li>View Equipment Details</li>
                <li>No Access to Downtime or User Mgmt</li>
            </ul>
        </div>

        <div className="role-card viewer">
            <div className="role-header">
                <Eye size={24} className="role-icon"/>
                <h4>Viewer</h4>
            </div>
            <p className="role-desc">Read-only access for auditing or general oversight.</p>
            <ul className="role-features">
                <li>View Equipment & Sites</li>
                <li>View PM Templates</li>
                <li>Cannot Edit or Delete Data</li>
                <li>No Access to Work Orders or Downtime</li>
            </ul>
        </div>
      </div>
    </div>
  );

  if (isNestedDetailPage) {
    return <Outlet />;
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading ? <LoadingSpinner asOverlay /> : null}

      <Modal 
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure?" 
        footer={
          <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%'}}>
            <Button variant="secondary" onClick={cancelDeleteHandler}>CANCEL</Button>
            <Button onClick={confirmDeleteHandler} style={{backgroundColor: '#dc2626', color: 'white'}}>DELETE</Button>
          </div>
        }
      >
        <p>Do you want to proceed and delete <strong>{siteToDelete?.name}</strong>? This will also delete the equipments assigned to this site. This action cannot be undone.</p>
      </Modal>

      <div className="settings-container animate-fade-in">
      <div className="page-header">
        <h2>System Settings</h2>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
            <button 
              className={`settings-nav-item ${activeTab === 'sites' ? 'active' : ''}`} 
              onClick={() => handleTabChange('sites')}
            >
                <Building size={18} />
                <span>Sites & Locations</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'users' ? 'active' : ''}`} 
              onClick={() => handleTabChange('users')}
            >
                <Users size={18} />
                <span>Users List</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} 
              onClick={() => handleTabChange('notifications')}
            >
                <Bell size={18} />
                <span>Notifications</span>
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`} 
              onClick={() => handleTabChange('security')}
            >
                <Shield size={18} />
                <span>Security & Roles</span>
            </button>
        </div>

        <div className="settings-content">
            {activeTab === 'sites' && renderSitesTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
      </div>
    </>
  );
};

const WrenchIcon = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

export default Settings;