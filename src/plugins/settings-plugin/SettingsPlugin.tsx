import React, { useState } from 'react'

const SettingsPlugin: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <>
      <plugin-badge
        text={`Dark Mode: ${darkMode ? 'On' : 'Off'}`}
        variant={darkMode ? 'success' : 'neutral'}
      />
      <plugin-divider spacing="md" />
      <plugin-toggle
        checked={darkMode}
        label="Enable dark mode"
        onChange={setDarkMode}
      />
      <plugin-divider spacing="lg" />
      <plugin-button
        label="Reset"
        variant="secondary"
        onClick={() => setDarkMode(false)}
      />
    </>
  )
}

export default SettingsPlugin

