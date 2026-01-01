import React from "react";

const categories = [
  "Bowls",
  "Smoothies",
  "Salads",
  "Wraps",
  "Drinks",
  "Snacks",
  "Desserts"
];

const MenuCategories: React.FC = () => (
  <div style={{ margin: '24px 16px 0 16px' }}>
    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Menu Categories</h3>
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
      {categories.map(cat => (
        <button
          key={cat}
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            border: 'none',
            background: '#f5f6ff',
            color: '#3730a3',
            fontWeight: 600,
            fontSize: '0.98rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

export default MenuCategories;
