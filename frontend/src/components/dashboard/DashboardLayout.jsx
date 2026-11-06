import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  FileEdit, 
  Clock, 
  CheckCircle, 
  FolderTree, 
  Image as ImageIcon, 
  Users, 
  Activity, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  Shield,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const DashboardLayout = () => {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'AI Assistant', to: '/dashboard/ai', icon: Sparkles, highlightAi: true },
    { label: 'All Content', to: '/dashboard/content', icon: FileText },
    { label: 'Create Content', to: '/dashboard/content/create', icon: PlusCircle, highlight: true },
    { label: 'Drafts', to: '/dashboard/content?status=draft', icon: FileEdit },
    { label: 'Pending Review', to: '/dashboard/content?status=pending_review', icon: Clock },
    { label: 'Published Content', to: '/dashboard/content?status=published', icon: CheckCircle },
    { label: 'Categories', to: '/dashboard/categories', icon: FolderTree },
    { label: 'Media Library', to: '/dashboard/media', icon: ImageIcon },
    // Admin only
    ...(isAdmin ? [{ label: 'User Management', to: '/dashboard/users', icon: Users }] : []),
    // Admin & Editor only
    ...((isAdmin || isEditor) ? [{ label: 'Activity Logs', to: '/dashboard/activity', icon: Activity }] : []),
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">ContentPilot</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = item.exact 
                ? location.pathname === item.to && !location.search 
                : item.to.includes('?') 
                  ? location.pathname + location.search === item.to
                  : location.pathname.startsWith(item.to) && !location.search;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : item.highlight
                        ? 'text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${item.highlightAi ? 'text-indigo-400' : ''}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.highlightAi && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-md border border-indigo-400/30">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Mini Card in Sidebar Bottom */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40">
            <div className="p-2.5 rounded-xl bg-slate-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <div className="mt-0.5">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1">
              <Link
                to="/"
                target="_blank"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                title="Open Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">ContentPilot CMS</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{location.pathname.replace('/dashboard', '').replace('/', '') || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              View Public Website
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <RoleBadge role={user?.role} />
              <span className="text-xs font-semibold text-slate-900 hidden md:inline">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;

