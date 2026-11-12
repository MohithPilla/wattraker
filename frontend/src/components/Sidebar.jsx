import React from 'react';
import {
  LayoutGrid,
  Pin,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'Personal', label: 'Personal', dotClass: 'personal' },
  { id: 'College', label: 'College', dotClass: 'college' },
  { id: 'Work', label: 'Work', dotClass: 'work' },
  { id: 'Other', label: 'Other', dotClass: 'other' },
];

const Sidebar = ({
  activeFilter,
  setActiveFilter,
  categoryCounts,
  isOpen,
  closeSidebar,
}) => {
  const { logout } = useAuth();

  const handleSelect = (filterType) => {
    setActiveFilter(filterType);
    closeSidebar();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.5rem',
          }}
          className="mobile-sidebar-header"
        >
          <span className="sidebar-section-title" style={{ padding: 0 }}>
            Workspace
          </span>
          {isOpen && (
            <button
              onClick={closeSidebar}
              className="modal-close-btn"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav>
          <ul className="sidebar-nav-list">
            <li>
              <button
                className={`sidebar-nav-item ${activeFilter === 'All' ? 'active' : ''}`}
                onClick={() => handleSelect('All')}
              >
                <span className="sidebar-nav-left">
                  <LayoutGrid size={18} />
                  <span>All Notes</span>
                </span>
                <span className="sidebar-badge">{categoryCounts?.all || 0}</span>
              </button>
            </li>

            <li>
              <button
                className={`sidebar-nav-item ${activeFilter === 'Pinned' ? 'active' : ''}`}
                onClick={() => handleSelect('Pinned')}
              >
                <span className="sidebar-nav-left">
                  <Pin size={18} />
                  <span>Pinned Notes</span>
                </span>
                <span className="sidebar-badge">{categoryCounts?.pinned || 0}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div>
          <div className="sidebar-section-title">Categories</div>
          <ul className="sidebar-nav-list">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`sidebar-nav-item ${activeFilter === cat.id ? 'active' : ''}`}
                  onClick={() => handleSelect(cat.id)}
                >
                  <span className="sidebar-nav-left">
                    <span className={`category-dot ${cat.dotClass}`} />
                    <span>{cat.label}</span>
                  </span>
                  <span className="sidebar-badge">
                    {categoryCounts?.[cat.id] || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="stats-card">
            <div>
              <div className="stats-label">Total Saved Notes</div>
              <div className="stats-value">{categoryCounts?.all || 0}</div>
            </div>
            <Sparkles size={22} color="var(--brand-primary)" />
          </div>

          <button
            className="dropdown-item logout"
            onClick={logout}
            style={{ justifyContent: 'flex-start' }}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

