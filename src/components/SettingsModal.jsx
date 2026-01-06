import useThemeStore, { THEMES } from '../store/themeStore'

export default function SettingsModal({ onClose }) {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  return (
    <div className="settings-overlay" onClick={handleBackdropClick}>
      <div className="settings-modal">
        <button className="settings-close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        
        <h2>Settings</h2>
        
        <div className="settings-section">
          <h3>Theme</h3>
          <div className="theme-grid">
            {Object.values(THEMES).map((t) => (
              <button
                key={t.id}
                className={`theme-option ${theme === t.id ? 'active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <div className="theme-preview">
                  <div 
                    className="theme-preview-bg" 
                    style={{ background: t.colorBg }}
                  />
                  <div className="theme-preview-pieces">
                    <div 
                      className="theme-preview-piece" 
                      style={{ 
                        background: t.colorPlayer1,
                        boxShadow: `0 2px 8px ${t.colorPlayer1Glow}`
                      }} 
                    />
                    <div 
                      className="theme-preview-piece" 
                      style={{ 
                        background: t.colorPlayer2,
                        boxShadow: `0 2px 8px ${t.colorPlayer2Glow}`
                      }} 
                    />
                  </div>
                </div>
                <span className="theme-name">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="settings-section about-section">
          <h3>About</h3>
          <p className="about-text">Created by Elias Simojoki</p>
          <div className="about-links">
            <a href="https://elias.simojoki.dev" target="_blank" rel="noopener noreferrer" className="about-link">
              elias.simojoki.dev
            </a>
            <a href="https://www.linkedin.com/in/elias-simojoki/" target="_blank" rel="noopener noreferrer" className="about-link linkedin" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

