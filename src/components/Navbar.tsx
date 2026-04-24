import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, User, LogOut, LayoutDashboard, MessageSquare, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">AutoVibe</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/listings" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Listings</Link>
            <Link to="/compare" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Compare</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-50 relative">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" className="h-8 w-8 rounded-full border-2 border-indigo-100" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600">Admin Panel</Link>
                    )}
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={login} className="bg-indigo-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/listings" className="block px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>Listings</Link>
              <Link to="/compare" className="block px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>Compare</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-4 py-3 text-slate-700 font-medium rounded-xl hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50">Sign Out</button>
                </>
              ) : (
                <button onClick={() => { login(); setIsMenuOpen(false); }} className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold">Sign In</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
