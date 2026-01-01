import React from "react";

interface Plan {
  name: string;
  description: string;
  price: string;
  badge?: string;
  buttonText: string;
  color: string;
}

const plans: Plan[] = [
  {
    name: "Balanced Plan",
    description: "Lunch + Dinner, Mon-Sat",
    price: "From ₹99/day",
    badge: "GUTZO Recommended",
    buttonText: "Start Trial",
    color: "#E6F5EE"
  },
  {
    name: "Protein Plan",
    description: "High protein, complete meals",
    price: "From ₹119/day",
    badge: "Muscle Building",
    buttonText: "Subscribe",
    color: "#EAF6FF"
  }
];

const PlanCards: React.FC = () => (
  <div style={{ margin: '24px 0 0 0' }}>
    <h2
      style={{
        fontFamily: 'Poppins',
        letterSpacing: '-0.01em',
        fontWeight: 500,
        color: '#111',
        textAlign: 'left',
        marginBottom: 16,
        fontSize: '20px',
      }}
    >
      Select your plans
    </h2>
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Balanced Plan */}
      <div style={{ background: plans[0].color, borderRadius: 12, padding: '20px', flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1BA672', marginBottom: 8 }}>{plans[0].badge}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4, color: '#1A1A1A' }}>{plans[0].name}</div>
        <div style={{ color: '#6B6B6B', fontSize: '0.95rem', marginBottom: 8 }}>{plans[0].description}</div>
        <div style={{ fontWeight: 700, color: '#1BA672', marginBottom: 12 }}>{plans[0].price}</div>
        <button style={{ background: '#1BA672', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>{plans[0].buttonText}</button>
      </div>
      {/* Protein Plan */}
      <div style={{ background: plans[1].color, borderRadius: 12, padding: '20px', flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1BA672', marginBottom: 8 }}>{plans[1].badge}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4, color: '#1A1A1A' }}>{plans[1].name}</div>
        <div style={{ color: '#6B6B6B', fontSize: '0.95rem', marginBottom: 8 }}>{plans[1].description}</div>
        <div style={{ fontWeight: 700, color: '#1BA672', marginBottom: 12 }}>{plans[1].price}</div>
        <button style={{ background: '#fff', color: '#1BA672', border: '2px solid #1BA672', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>{plans[1].buttonText}</button>
      </div>
    </div>
  </div>
);

export default PlanCards;
