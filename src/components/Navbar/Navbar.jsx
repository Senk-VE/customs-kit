import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveGroup(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const groups = {
    sd: [
      {
        title: 'Расчет срока ИМ СД',
        href: '/deadline-calculator',
      },
      {
        title: 'Конвертор валют СД',
        href: '/currency-converter',
      },
      {
        title: 'Контроль данных XML',
        href: '/xml-analyzer',
      },
    ],
    dt: [
      {
        title: 'Извлечь файлы из XML',
        href: '/xml-extractor',
      },
    ],
  };

  function toggleGroup(group) {
    setActiveGroup(activeGroup === group ? null : group);
  }

  function closeMenu() {
    setActiveGroup(null);
    setIsOpen(false);
  }

  return (
    <header ref={navRef} className={`nav-container ${isOpen ? 'active' : ''}`}>
      <div className="nav-content">
        <div className="nav-item-logo">
          <Link to="/" onClick={closeMenu}>
            <img
              src="/customs-kit/gear-logo.png"
              alt=""
              className="nav-logo-gear"
            />
            ustoms<span className="logo-dot">·</span>Kit
          </Link>
        </div>
        <nav className="nav-item-menu">
          <ul>
            <li className={`nav-group ${activeGroup === 'sd' ? 'active' : ''}`}>
              <button onClick={() => toggleGroup('sd')}>
                СД | Статистическое декларирование
                <FiChevronDown className="nav-arrow" />
              </button>

              {activeGroup === 'sd' && (
                <div className="dropdown-menu">
                  {groups.sd.map((item) => (
                    <Link key={item.href} to={item.href} onClick={closeMenu}>
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li className={`nav-group ${activeGroup === 'dt' ? 'active' : ''}`}>
              <button onClick={() => toggleGroup('dt')}>
                ДТ | Декларация на товары
                <FiChevronDown className="nav-arrow" />
              </button>

              {activeGroup === 'dt' && (
                <div className="dropdown-menu">
                  {groups.dt.map((item) => (
                    <Link key={item.href} to={item.href} onClick={closeMenu}>
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li>
              <Link to="/about" onClick={closeMenu}>
                О приложении
              </Link>
            </li>
          </ul>

          <div className="mobile-nav">
            <Link to="/deadline-calculator" onClick={closeMenu}>
              СД | Расчет срока ИМ
            </Link>

            <Link to="/currency-converter" onClick={closeMenu}>
              СД | Конвертор валют
            </Link>

            <Link to="/xml-analyzer" onClick={closeMenu}>
              СД | Контроль данных XML
            </Link>

            <Link to="/xml-extractor" onClick={closeMenu}>
              ДТ | Извлечь файлы из XML
            </Link>

            <Link to="/about" onClick={closeMenu}>
              О приложении
            </Link>
          </div>
        </nav>

        <div className="nav-item-toggle" onClick={() => setIsOpen(!isOpen)}>
          <div className="toggle-bar toggle-bar-top"></div>
          <div className="toggle-bar toggle-bar-middle"></div>
          <div className="toggle-bar toggle-bar-bottom"></div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
