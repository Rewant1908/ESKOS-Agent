import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { href: '/',            icon: '🔍', label: 'Search'     },
    { href: '/graph',       icon: '🕸️', label: 'Graph'      },
    { href: '/chat',        icon: '🤖', label: 'AI Chat'    },
    { href: '/governance',  icon: '📋', label: 'Governance' },
  ];
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">EK</div>
        ESKO<span>S</span>
      </Link>
      <div className="navbar-nav">
        {links.map(l => (
          <Link key={l.href} to={l.href} className={`nav-link${pathname === l.href ? ' active' : ''}`}>
            <span>{l.icon}</span>{l.label}
          </Link>
        ))}
      </div>
      <div className="nav-status">
        <div className="nav-status-dot" />
        Live
      </div>
    </nav>
  );
}
