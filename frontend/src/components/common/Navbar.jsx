import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  FileText, 
  Radio, 
  Bell, 
  Calendar, 
  Info, 
  Mail,
  LogOut,
  ChevronDown,
  Search,
  Sparkles,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { RoleBadge } from './Badge';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    setCurrentDateStr(formatted);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/articles' },
    { name: 'News', path: '/news' },
    { name: 'Announcements', path: '/announcements' },
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/articles?search=${encodeURIComponent(navSearchQuery.trim())}`);
      setSearchOpen(false);
      setNavSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      
      {/* Top Editorial Masthead Strip */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px] font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-semibold">{currentDateStr}</span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Global Tech & Editorial Dispatch
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-slate-400">
              <span className="text-slate-500">Trending:</span>
              <Link to="/articles?search=Architecture" className="hover:text-white transition-colors">Architecture</Link>
              <Link to="/articles?search=Publishing" className="hover:text-white transition-colors">Publishing</Link>
              <Link to="/articles?search=PostgreSQL" className="hover:text-white transition-colors">Supabase</Link>
            </div>
            <span className="text-slate-700 hidden md:inline">|</span>
            {user ? (
              <Link 
                to="/dashboard"
                className="inline-flex items-center gap-1 text-indigo-300 hover:text-white font-semibold transition-colors"
              >
                <span>CMS Workspace</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <Link 
                to="/login"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-semibold transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Staff Portal</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Publication Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Masthead Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300 border border-indigo-500/20">
              <Compass className="w-6 h-6 text-indigo-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tighter text-slate-950 font-serif">
                  CONTENTPILOT
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  AI
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest -mt-0.5">
                The Editorial Technology Review
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-semibold tracking-tight transition-all rounded-xl ${
                    active
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleNavSearch} className="flex items-center animate-fadeIn">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={navSearchQuery}
                      onChange={(e) => setNavSearchQuery(e.target.value)}
                      placeholder="Search articles & news..."
                      className="w-56 sm:w-64 pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                  title="Search stories"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User Profile or CMS Action */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.full_name}</p>
                    <RoleBadge role={user.role} />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Signed In As</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        CMS Dashboard
                      </Link>
                      <Link
                        to="/dashboard/content/create"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Draft New Story
                      </Link>
                      <Link
                        to="/dashboard/ai"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI Editorial Studio
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-indigo-600 shadow-md transition-all"
                >
                  <span>CMS Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        {searchOpen && (
          <form onSubmit={handleNavSearch} className="lg:hidden pb-4 pt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="Search articles, news & events..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4 shadow-xl">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-indigo-600 bg-indigo-50 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 font-bold uppercase">Logged in as</p>
                  <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Open CMS Workspace
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2.5 rounded-xl text-sm font-bold bg-slate-950 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
