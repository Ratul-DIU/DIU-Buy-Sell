import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function FullScreenHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  async function logout() {
    await signOut(auth);
    router.push('/');
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/add-product', label: 'Add Product' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <>
      <header className={`header-fullscreen ${menuOpen ? 'menu-active' : ''}`} role="banner" aria-label="Primary Header">
        <div className="header-container" tabIndex={-1}>
          {/* Brand */}
          <Link href="/" legacyBehavior>
            <a className="brand" aria-label="Home - DIU Buy & Sell" onClick={() => setMenuOpen(false)}>
              <div className="logo" aria-hidden="true" tabIndex={-1}>DIU</div>
              <div className="title">
                <div className="name">DIU Buy & Sell</div>
                <div className="tag">University Marketplace</div>
              </div>
            </a>
          </Link>

          {/* Search Bar */}
          <div className="search-bar" role="search">
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              className="search-input"
              spellCheck="false"
              autoComplete="off"
            />
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              focusable="false"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>

          {/* Desktop Nav */}
          <nav className="nav-desktop" aria-label="Primary Navigation">
            {navItems.map(({ href, label }) => (
              <Link href={href} key={label} legacyBehavior>
                <a className="nav-link">{label}</a>
              </Link>
            ))}

            {user ? (
              <button onClick={logout} className="btn btn-logout" type="button" aria-label="Logout">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" legacyBehavior><a className="btn btn-login">Login</a></Link>
                <Link href="/register" legacyBehavior><a className="btn btn-register">Register</a></Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="btn btn-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
            </button>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className={`hamburger-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className={`nav-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile Navigation">
          {navItems.map(({ href, label }) => (
            <Link href={href} key={label} legacyBehavior>
              <a className="nav-link-mobile" onClick={() => setMenuOpen(false)}>{label}</a>
            </Link>
          ))}

          {user ? (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="btn btn-logout-mobile"
              type="button"
            >
              Log out
            </button>
          ) : (
            <>
              <Link href="/login" legacyBehavior>
                <a className="btn btn-login-mobile" onClick={() => setMenuOpen(false)}>Login</a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a className="btn btn-register-mobile" onClick={() => setMenuOpen(false)}>Register</a>
              </Link>
            </>
          )}

          <button
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
            className="btn btn-theme-toggle-mobile"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '🌞 Light' : '🌙 Dark'}
          </button>
        </nav>
      </header>

      <style jsx>{`
        /* Root & Container */
        .header-fullscreen {
          position: sticky;
          top: 0;
          width: 100%;
          background: var(--bg-elev);
          border-bottom: 1px solid var(--surface-2);
          box-shadow:
            0 2px 6px rgba(0,0,0,0.12),
            0 8px 24px rgba(0,0,0,0.08);
          z-index: 10000;
          user-select: none;
          animation: fadeSlideDown 0.4s ease forwards;
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .header-container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: nowrap;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 18px;
          color: var(--text);
          font-weight: var(--fw-bold);
          text-decoration: none;
          cursor: pointer;
          min-width: 0;
          flex-shrink: 0;
          user-select: none;
        }
        .logo {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--fw-bold);
          font-size: 28px;
          background: linear-gradient(135deg, #4b6cb7, #182848); /* professional blue gradient */
          box-shadow:
            0 4px 8px rgba(75,108,183,0.35),
            0 8px 12px rgba(24,40,72,0.25);
          transition: transform 0.3s ease;
          color: white;
          user-select: none;
        }
        .logo:hover,
        .logo:focus-visible {
          transform: translateY(-6px) rotate(-2deg);
          outline: none;
          box-shadow:
            0 8px 16px rgba(75,108,183,0.6),
            0 12px 20px rgba(24,40,72,0.45);
        }
        .title {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          overflow: hidden;
          user-select: none;
        }
        .name {
          font-size: clamp(20px, 2.5vw, 26px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
          color: var(--text);
        }
        .tag {
          font-size: 13px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
          user-select: none;
        }

        /* Search Bar */
        .search-bar {
          position: relative;
          flex: 1 1 320px;
          max-width: 480px;
          background: var(--card);
          border-radius: 16px;
          border: 1.5px solid var(--surface-2);
          padding: 10px 44px 10px 20px;
          box-shadow:
            inset 0 0 10px rgba(0,0,0,0.07);
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
          user-select: none;
        }
        .search-bar:focus-within {
          box-shadow:
            0 0 10px 2px #4b6cb7;
          border-color: #4b6cb7;
        }
        .search-input {
          width: 100%;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 15px;
          font-weight: 500;
          outline-offset: 3px;
          caret-color: #4b6cb7;
          user-select: text;
          transition: color 0.3s ease;
        }
        .search-input::placeholder {
          color: rgba(100, 116, 139, 0.5);
          font-style: italic;
          letter-spacing: 0.02em;
          transition: color 0.3s ease;
        }
        .search-input:focus::placeholder {
          color: transparent;
        }
        .search-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(100, 116, 139, 0.5);
          pointer-events: none;
          user-select: none;
          transition: color 0.3s ease;
        }
        .search-input:focus + .search-icon {
          color: #4b6cb7;
          filter: drop-shadow(0 0 3px #4b6cb7);
        }

        /* Desktop nav */
        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: nowrap;
          user-select: none;
        }
        .nav-link {
          position: relative;
          font-weight: 500;
          font-size: 15px;
          color: var(--text);
          text-decoration: none;
          padding: 8px 12px;
          cursor: pointer;
          user-select: none;
          transition: color 0.25s ease;
          border-radius: var(--radius-sm);
        }
        .nav-link:hover,
        .nav-link:focus-visible {
          color: #4b6cb7;
          outline-offset: 3px;
          outline-color: #4b6cb7;
          outline-style: solid;
          outline-width: 2px;
        }

        /* Buttons */
        .btn {
          border: none;
          cursor: pointer;
          font-weight: 600;
          border-radius: var(--radius-md);
          padding: 10px 20px;
          background-color: #4b6cb7;
          color: #fff;
          box-shadow:
            0 4px 12px rgba(75,108,183,0.5);
          user-select: none;
          transition:
            transform 0.25s ease-in-out,
            box-shadow 0.25s ease-in-out,
            background-color 0.25s ease-in-out;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .btn:hover,
        .btn:focus-visible {
          transform: translateY(-3px);
          background-color: #3a539b;
          box-shadow:
            0 6px 16px rgba(58,83,155,0.7);
          outline: none;
        }
        .btn:active {
          transform: translateY(-1px) scale(0.98);
          background-color: #2f427a;
          box-shadow:
            0 3px 8px rgba(47,66,122,0.5);
        }
        .btn-logout {
          background-color: #dc3545;
          box-shadow:
            0 4px 12px rgba(220,53,69,0.5);
        }
        .btn-logout:hover,
        .btn-logout:focus-visible {
          background-color: #b02a37;
          box-shadow:
            0 6px 16px rgba(176,42,55,0.7);
        }
        .btn-logout:active {
          background-color: #861c24;
          box-shadow:
            0 3px 8px rgba(134,28,36,0.5);
        }

        /* Hamburger */
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 28px;
          height: 22px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-left: 24px;
          user-select: none;
          z-index: 1101;
          transition: transform 0.3s ease;
        }
        .hamburger-btn span {
          display: block;
          height: 3.5px;
          background: var(--text);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: 1px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .hamburger-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        .hamburger-btn.open span:nth-child(2) {
          opacity: 0;
          transform: translateX(24px);
        }
        .hamburger-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }

        /* Mobile Nav */
        .nav-mobile {
          display: none;
          position: fixed;
          top: 72px;
          left: 0;
          width: 100%;
          background: var(--card);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.4);
          border-top: 1px solid rgba(255 255 255 / 0.05);
          backdrop-filter: saturate(180%) blur(18px);
          flex-direction: column;
          gap: 20px;
          padding: 28px 36px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.4s ease;
          z-index: 1050;
          user-select: none;
          -webkit-overflow-scrolling: touch;
        }
        .nav-mobile.open {
          display: flex;
          max-height: 100vh;
          padding: 28px 36px;
          overflow-y: auto;
        }
        .nav-link-mobile {
          color: var(--text);
          font-weight: 600;
          font-size: 18px;
          text-decoration: none;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255 255 255 / 0.12);
          user-select: none;
          transition: color 0.3s ease;
          border-radius: var(--radius-sm);
        }
        .nav-link-mobile:hover,
        .nav-link-mobile:focus-visible {
          color: #4b6cb7;
          outline-offset: 3px;
          outline-color: #4b6cb7;
          outline-style: solid;
          outline-width: 2px;
          background: rgba(75,108,183,0.1);
          outline-offset: 3px;
          outline-color: #4b6cb7;
          outline-style: solid;
          outline-width: 2px;
        }

        .btn-login-mobile,
        .btn-register-mobile,
        .btn-logout-mobile,
        .btn-theme-toggle-mobile {
          margin-top: 18px;
          width: 100%;
          text-align: center;
          font-weight: 700;
          border-radius: var(--radius-md);
          padding: 16px 0;
          background: linear-gradient(90deg, #4b6cb7, #182848);
          color: white;
          box-shadow:
            0 8px 20px rgba(75,108,183,0.75);
          user-select: none;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            filter 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-login-mobile:hover,
        .btn-register-mobile:hover,
        .btn-theme-toggle-mobile:hover,
        .btn-login-mobile:focus-visible,
        .btn-register-mobile:focus-visible,
        .btn-theme-toggle-mobile:focus-visible {
          transform: translateY(-6px) scale(1.05);
          filter: brightness(1.12);
          outline: none;
          box-shadow:
            0 14px 44px rgba(75,108,183,0.9);
        }
        .btn-logout-mobile {
          background-color: #dc3545;
          box-shadow:
            0 8px 20px rgba(220,53,69,0.85);
        }
        .btn-logout-mobile:hover,
        .btn-logout-mobile:focus-visible {
          filter: brightness(1.15);
          box-shadow:
            0 12px 30px rgba(220,53,69,1);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .search-bar {
            max-width: 280px;
            flex: 1 1 180px;
          }
        }
        @media (max-width: 820px) {
          .nav-desktop {
            display: none;
          }
          .hamburger-btn {
            display: flex;
          }
          .header-container {
            padding: 16px 24px;
            gap: 12px;
          }
          .brand .logo {
            width: 52px;
            height: 52px;
            font-size: 20px;
          }
          .brand .name {
            font-size: clamp(16px, 5vw, 20px);
          }
          .brand .tag {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}
