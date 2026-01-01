import React, { useState } from "react";

const TABS = [
  { key: "plans", label: "Plans" },
  { key: "now", label: "Now" },
  { key: "lock", label: "Lock meals" }
];

const tabStyles = {
  base: {
    flex: 1,
    padding: '10px 0',
    fontWeight: 600,
    fontSize: '1rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    color: '#444',
    outline: 'none',
    transition: 'border-color 0.2s, color 0.2s'
  },
  active: {
    borderBottom: '2px solid #6366f1',
    color: '#3730a3',
    background: '#f5f6ff'
  }
};

const VendorTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');
  return (
    <div style={{ display: 'flex', gap: 0, margin: '16px 16px 0 16px', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          style={{ ...tabStyles.base, ...(activeTab === tab.key ? tabStyles.active : {}) }}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default VendorTabs;
