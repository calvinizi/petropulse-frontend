import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Wrench, FileText, Activity, 
  AlertTriangle, User, Calendar, LogOut, Cog, Shield
} from 'lucide-react';
import './Sidebar.css'; 
import { useLogin } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const Sidebar = (props) => {

  const { logout } = useLogin()
  const { currentUser, isLoading } = useCurrentUser()
  
  const role = currentUser?.role;

  const getLinkClass = ({ isActive }) => {
    return isActive ? 'nav-item active' : 'nav-item';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ background: '#2563eb', padding: '6px', borderRadius: '6px', display: 'flex' }}>
          <Activity size={20} color="white" />
        </div>
        PetroPulse
      </div>

      <div className="content-scroll">
        <div className="nav-section-title">Overview</div>
        
        <NavLink to="/" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <div className="nav-section-title">Operations</div>
        
        <NavLink to="/equipment" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <Wrench size={20} />
          <span>Equipment</span>
        </NavLink>

        <NavLink to="/workorders" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <FileText size={20} />
          <span>Work Orders</span>
        </NavLink>

        <NavLink to="/downtime" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <AlertTriangle size={20} />
          <span>Downtime</span>
        </NavLink>
        
        <div className="nav-section-title">Management</div>

        <NavLink to="/pm-templates" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <Calendar size={20} />
          <span>PM Templates</span>
        </NavLink>

        {/* ADMIN ONLY - Audit Logs */}
        {role === 'Admin' && (
          <NavLink to="/audit-logs" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
            <Shield size={20} />
            <span>Audit Logs</span>
          </NavLink>
        )}

        <div className="nav-section-title">System</div>

        <NavLink to="/settings" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <Cog size={20} />
          <span>Settings</span>
        </NavLink>

        <NavLink to="/profile" className={getLinkClass} style={{textDecoration: "none"}} onClick={props.onClose}>
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </div>

      <div className="user-profile">
        <div style={{ width: '36px', height: '36px', background: '#1e293b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: 'bold' }}>
          {isLoading ? '...' : (
            <img 
              src={currentUser?.avatar ? `${process.env.REACT_APP_ASSET_URL}/${currentUser.avatar}` : ''} 
              alt={currentUser?.name?.charAt(0).toUpperCase()} 
              style={{
                objectFit:"cover",
                height:"100%",
                width:"100%",
                borderRadius:"50%",
                display: currentUser?.avatar ? 'block' : 'none'
              }} 
            />
            )}
             {!currentUser?.avatar && !isLoading && (
              <span>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{currentUser?.name || 'User'}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{currentUser?.role || 'Supervisor'}</p>
        </div>
        <LogOut size={16} style={{ cursor: 'pointer' }} onClick={logout} />
      </div>
    </aside>
  );
};

export default Sidebar;