import React, { useEffect, useState } from 'react';
import { 
  Activity, FileText, AlertOctagon, Calendar, 
  Clock, Sun, Moon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import PredictiveMaintenanceWidget from './PredictiveMaintenanceWidget';
import Card from "../../components/common/Card";
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorModal from '../../components/common/ErrorModal';
import Button from '../../components/common/Button';
import { useHttpClient } from '../../hooks/HttpHook';
import { useLogin } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

import { formatDistanceToNow } from 'date-fns';

import './Dashboard.css';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const { sendRequest, isLoading, error, clearError } = useHttpClient();
  const { token } = useLogin();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    operationalHealth: 0,
    activeDowntime: 0,
    openWorkOrders: 0,
    overduePMs: 0,
    chartData: []
  });


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/notifications/lastfour`,
          'GET',
          null,
          {
            Authorization: 'Bearer ' + token
          }
        );

        setNotifications(responseData.notifications);
      } catch (err) {
        console.log('Failed to fetch notifications:', err);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [sendRequest, token]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/dashboard`,
          'GET',
          null,
          {
            Authorization: 'Bearer ' + token
          }
        );

        setDashboardData({
          operationalHealth: responseData.operationalHealth || 0,
          activeDowntime: responseData.activeDowntime || 0,
          openWorkOrders: responseData.openWorkOrders || 0,
          overduePMs: responseData.overduePMs || 0,
          chartData: responseData.chartData || []
        });
      } catch (err) {
        console.log('Failed to fetch dashboard stats:', err);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [sendRequest, token]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}

      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header dashboard-header">
          <div className="dashboard-header-content">
            <div>
              <h2>Dashboard</h2>
              <p className="text-muted">{new Date().toDateString()}</p>
            </div>
            <Button
              className="theme-toggle-btn"
              icon={isDarkMode ? Sun : Moon}
              onClick={toggleTheme}
              variant="secondary"
              size="sm"
            />
          </div>
        </div>

        {/* KPI Grid */}
        <div className="dashboard-kpi-grid">
          <Card>
            <div className="kpi-inner">
              <div>
                <p className="text-muted">Operational Health</p>
                <h3>{dashboardData.operationalHealth}%</h3>
              </div>
              <div className="icon-badge green">
                <Activity size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="kpi-inner">
              <div>
                <p className="text-muted">Active Downtime</p>
                <h3 style={{color:'var(--danger)'}}>
                  {dashboardData.activeDowntime} {dashboardData.activeDowntime === 1 ? 'Unit' : 'Units'}
                </h3>
              </div>
              <div className="icon-badge red">
                <AlertOctagon size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="kpi-inner">
              <div>
                <p className="text-muted">Open Work Orders</p>
                <h3>{dashboardData.openWorkOrders}</h3>
              </div>
              <div className="icon-badge blue">
                <FileText size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="kpi-inner">
              <div>
                <p className="text-muted">Overdue PMs</p>
                <h3 style={{color:'var(--warning)'}}>{dashboardData.overduePMs}</h3>
              </div>
              <div className="icon-badge orange">
                <Calendar size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts & Activity Section */}
        <div className="dashboard-content-grid">
          {/* Main Chart */}
          <div className="chart-section">
            <Card>
              <div className="section-header">
                <h3>Downtime Cost Trend</h3>
                <span className="badge-soft">Last 7 Days</span>
              </div>
              <div className="chart-wrapper">
                {dashboardData.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dashboardData.chartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={isDarkMode ? '#334155' : '#e2e8f0'} 
                      />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} 
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} 
                        tickFormatter={(val) => `NGN ${val}`}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#10b981', fontSize: 12}} 
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderRadius: '8px', 
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          color: isDarkMode ? '#f1f5f9' : '#0f172a'
                        }}
                      />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorCost)" 
                        name="Downtime Cost"
                      />
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="uptime" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="none" 
                        name="Uptime %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                  }}>
                    No downtime data available for the last 7 days
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Side: Recent Activity */}
          <div className="activity-section">
            <Card>
              <div className="section-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                {notifications.length > 0 ? (
                notifications.map((act) => (
                    <div key={act.id} className="activity-item">
                      <div className={`activity-dot ${act.type}`}></div>
                      
                      <div className="activity-info">
                        <p className="activity-text">{act.message}</p>
                        
                        <span className="activity-time">
                          <Clock size={12} style={{ marginRight: 4 }} />
                          {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="activity-info">
                    <p className="activity-text">No notifications available</p>
                  </div>
                )}
              </div>
              <div className="view-more">
                <button onClick={()=>navigate("/settings/notifications")}>View Full Log</button>
              </div>
            </Card>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <PredictiveMaintenanceWidget />
        </div>
      </div>
    </>
  );
};

export default Dashboard;