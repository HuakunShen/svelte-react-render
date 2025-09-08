import React from 'react'

const ChipPlugin: React.FC = () => {
  return (
    <>
      <plugin-chip label="Beta" variant="info" />
      <plugin-divider spacing="sm" />
      <plugin-chip label="Stable" variant="success" />
      <plugin-divider spacing="sm" />
      <plugin-chip label="Deprecated" variant="danger" />
    </>
  )
}

export default ChipPlugin

