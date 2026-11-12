import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Sun,
  Moon,
  LogOut,
  User,
  X,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  toggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <button
          className="menu-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="brand-logo">
          <div className="brand-icon">
            <FileText size={20} />
          </div>
          <span>NoteSphere</span>
        </div>
      </div>

      <div className="nav-search">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="nav-actions">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        <button
          className="add-note-btn"
          onClick={onOpenCreateModal}
          title="Create a new note"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Note</span>
        </button>

        <div className="user-profile-menu" ref={dropdownRef}>
          <button
            className="user-avatar-btn"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-expanded={profileDropdownOpen}
            aria-label="User profile menu"
          >
            <div className="user-avatar-circle">
              {getInitials(user?.name)}
            </div>
            <span className="user-name-label">{user?.name || 'Account'}</span>
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-info">
                <div className="dropdown-name">{user?.name}</div>
                <div className="dropdown-email">{user?.email}</div>
              </div>

              <button
                className="dropdown-item logout"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

