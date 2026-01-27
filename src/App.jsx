import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import SideDrawer from './components/layout/SideDrawer';
import Backdrop from './components/common/Backdrop';
import MobileNav from './components/layout/MobileNav';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import EquipmentList from './pages/Equipment/EquipmentList';
import EquipmentNew from './pages/Equipment/EquipmentNew';
import EquipmentDetail from './pages/Equipment/EquipmentDetail';
import EquipmentEdit from './pages/Equipment/EquipmentEdit';
import EquipmentAnalysis from './pages/Equipment/EquipmentAnalysis/EquipmentAnalysis';
import PMTemplateList from './pages/PMTemplate/PMTemplateList';
import PMTemplateNew from './pages/PMTemplate/PMTemplateNew';
import PMTemplateDetail from './pages/PMTemplate/PMTemplateDetail';
import PMTemplateEdit from './pages/PMTemplate/PMTemplateEdit';
import WorkOrderDetail from './pages/WorkOrder/WorkOrderDetail';
import WorkOrderList from './pages/WorkOrder/WorkOrderList';
import WorkOrderNew from './pages/WorkOrder/WorkOrderNew';
import WorkOrderEdit from './pages/WorkOrder/WorkOrderEdit';
import DowntimeList from './pages/Downtime/DowntimeList';
import DowntimeDetail from './pages/Downtime/DowntimeDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings/Settings';
import SiteNew from './pages/Settings/Site/SiteNew';
import SiteEdit from './pages/Settings/Site/SiteEdit';
import SiteDetail from './pages/Settings/Site/SiteDetail';
import NotificationDetail from './pages/Settings/Notification/NotificationDetail';
import AuditLogList from './pages/AuditLog/AuditLogList';
import AuditLogDetail from './pages/AuditLog/AuditLogDetail';
import Auth from './user/Auth';
import ToastContainer from './components/common/ToastContainer';

import { useLogin, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn } = useLogin();

  const openDrawer = () => setIsMobileMenuOpen(true);
  const closeDrawer = () => setIsMobileMenuOpen(false);

  return (
    <Router>
      {isLoggedIn && <ToastContainer />}
      <Routes>
        {/* Public Route */}
        {!isLoggedIn && (
           <>
             <Route path="/auth/*" element={<Auth />} />
             <Route path="*" element={<Navigate to="/auth" replace />} />
           </>
        )}

        {/* Protected Routes */}
        {isLoggedIn && (
          <Route path="/*" element={
            <div className="app-layout">
              
              {isMobileMenuOpen && <Backdrop onClick={closeDrawer} />}
              
              <SideDrawer show={isMobileMenuOpen} onClick={closeDrawer}>
                 <MobileNav onClose={closeDrawer} />
              </SideDrawer>

              <div className="sidebar-desktop-wrapper">
                <Sidebar />
              </div>

              <main className="main-content">
                <Navbar onOpenDrawer={openDrawer} />
                
                <div className="content-scroll">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/equipment" element={<EquipmentList />} />
                    <Route path="/equipment/new" element={<EquipmentNew />} />
                    <Route path="/equipment/:id" element={<EquipmentDetail />} />
                    <Route path="/equipment/edit/:id" element={<EquipmentEdit />} />
                    <Route path="/equipment/analysis" element={<EquipmentAnalysis />} />
                    
                    <Route path="/pm-templates" element={<PMTemplateList />} />
                    <Route path="/pm-templates/new" element={<PMTemplateNew />} />
                    <Route path="/pm-templates/:id" element={<PMTemplateDetail />} />
                    <Route path="/pm-templates/edit/:id" element={<PMTemplateEdit />} />
                    
                    <Route path="/workorders" element={<WorkOrderList />} />
                    <Route path="/workorders/new" element={<WorkOrderNew />} />
                    <Route path="/workorders/:id" element={<WorkOrderDetail />} />
                    <Route path="/workorders/edit/:id" element={<WorkOrderEdit />} />

                    <Route path="/downtime" element={<DowntimeList />} />
                    <Route path="/downtime/:id" element={<DowntimeDetail />} />

                    {/* ADMIN ONLY */}
                    <Route path="/audit-logs" element={<AuditLogList />} />
                    <Route path="/audit-logs/:id" element={<AuditLogDetail />} />

                    <Route path="/profile" element={<Profile />} />
                    
                    <Route path="/settings/*" element={<Settings />}>
                        <Route path="sites/new" element={<SiteNew />} />
                        <Route path="sites/edit/:id" element={<SiteEdit />} />
                        <Route path="notifications/:id" element={<NotificationDetail />} />
                    </Route>

                    <Route path="/sites/:id" element={<SiteDetail />} />
                    
                    <Route path="/mytasks" element={<div style={{padding:'2rem', textAlign:'center'}}>My Tasks Placeholder</div>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
        )}
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
    </ThemeProvider>
  );
}