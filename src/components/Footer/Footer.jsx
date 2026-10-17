import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo"></div>

            <p>
              Frontend-инструменты для статистического декларирования и
              обработки таможенных данных.
            </p>

            <div className="footer-info">
              <Link to="/privacy">
                <span className="desktop-text">КОНФИДЕНЦИАЛЬНОСТЬ</span>
                <span className="mobile-text">КОНФИДЕНЦИАЛЬНОСТЬ</span>
              </Link>

              <Link to="/terms">
                <span className="desktop-text">УСЛОВИЯ ПОЛЬЗОВАНИЯ</span>
                <span className="mobile-text">УСЛОВИЯ</span>
              </Link>

              <a
                href="https://senk-ve.github.io/customs-kit/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-developer-text"
              >
                <span className="desktop-text">САЙТ РАЗРАБОТЧИКА</span>
                <span className="mobile-text">РАЗРАБОТЧИК</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            <span>© {new Date().getFullYear()} CUSTOMS·KIT</span>

            <span>FRONTEND DEVELOPMENT PROJECT</span>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/Senk-VE"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub className="footer-icon" />
              <span className="footer-link-text">GITHUB</span>
            </a>

            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin className="footer-icon" />
              <span className="footer-link-text">LINKEDIN</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
