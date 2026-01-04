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
      </div>
    </div>
  )
}

