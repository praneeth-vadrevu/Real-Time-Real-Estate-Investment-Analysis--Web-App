import React from 'react';

const Footer: React.FC = () => {
  const developers = [
    'V S Praneeth',
    'Xiangtao Fu',
    'Sireesha Baratam',
  ];

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-title">Developed By</h4>
          <div className="developers-list">
            {developers.map((developer, index) => (
              <span key={index} className="developer-name">
                {developer}
                {index < developers.length - 1 && <span className="developer-separator">, </span>}
              </span>
            ))}
          </div>
        </div>
        <div className="footer-section">
          <p className="footer-copyright">
            © {new Date().getFullYear()} HouseHustle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

