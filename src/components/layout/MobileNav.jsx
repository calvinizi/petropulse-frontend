import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Wrench, FileText, AlertTriangle, 
  Calendar, User, LogOut, ChevronRight, Activity, Cog, Shield 
} from 'lucide-react';
import './MobileNav.css';
import { useLogin } from '../../context/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const MobileNav = (props) => {
  
  const { logout, role } = useLogin();
  const { currentUser } = useCurrentUser()

  const getLinkClass = ({ isActive }) => {
    return `mobile-nav-item ${isActive ? 'active' : ''}`;
  };

  return (
    <div className="mobile-nav-container">
      
      <div className="mobile-nav-header">
        <div className="mobile-logo-box">
          <Activity size={24} color="white" />
        </div>
        <div className="mobile-header-text">
          <span className="brand-name">PetroPulse</span>
        </div>
      </div>

      <div className="mobile-nav-links">
        <div className="mobile-group-label">Menu</div>
        
        <NavLink to="/" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><LayoutDashboard size={20} /></div>
          <span className="link-text">Dashboard</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        <NavLink to="/equipment" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><Wrench size={20} /></div>
          <span className="link-text">Equipment</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        <NavLink to="/workorders" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><FileText size={20} /></div>
          <span className="link-text">Work Orders</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        <NavLink to="/downtime" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><AlertTriangle size={20} /></div>
          <span className="link-text">Downtime</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        <div className="mobile-group-label" style={{marginTop: '1.5rem'}}>Management</div>

        <NavLink to="/pm-templates" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><Calendar size={20} /></div>
          <span className="link-text">PM Schedules</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        
        {role === 'Admin' && (
          <NavLink to="/audit-logs" className={getLinkClass} onClick={props.onClose}>
            <div className="icon-box"><Shield size={20} /></div>
            <span className="link-text">Audit Logs</span>
            <ChevronRight size={16} className="arrow-icon" />
          </NavLink>
        )}

        <NavLink to="/settings" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><Cog size={20} /></div>
          <span className="link-text">Settings</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>

        <NavLink to="/profile" className={getLinkClass} onClick={props.onClose}>
          <div className="icon-box"><User size={20} /></div>
          <span className="link-text">My Profile</span>
          <ChevronRight size={16} className="arrow-icon" />
        </NavLink>
      </div>
      
      <div className="mobile-nav-footer">
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">
            {currentUser?.avatar ? (
              <img src={`${currentUser?.avatar}`} alt={currentUser?.name} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="mobile-user-details">
            <span className="mobile-user-name">{currentUser?.name || 'User'}</span>
            <span className="mobile-user-role">{role}</span>
          </div>
        </div>
        <button onClick={logout} className="mobile-logout-btn" type="button">
          <LogOut size={20} />
        </button>
      </div>    
    </div>
  );
};

export default MobileNav;