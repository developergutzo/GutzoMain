import React from "react";

interface VendorStatusBarProps {
  status: string;
}

const VendorStatusBar: React.FC<VendorStatusBarProps> = ({ status }) => (
  <div style={{ background: '#e6fbe6', color: '#217a36', padding: '8px 16px', fontWeight: 500, fontSize: '1rem', borderRadius: 8, margin: '12px 16px 0 16px', display: 'flex', alignItems: 'center' }}>
    <span style={{ marginRight: 8, fontSize: '1.2em' }}>✔️</span>
    {status}
  </div>
);

export default VendorStatusBar;
