import React from "react";

const futureMeals = [
  {
    id: "fm1",
    name: "Lunch Bowl",
    time: "Tomorrow Lunch",
    image: "https://via.placeholder.com/60x60?text=Lunch"
  },
  {
    id: "fm2",
    name: "Protein Wrap",
    time: "Tomorrow Dinner",
    image: "https://via.placeholder.com/60x60?text=Wrap"
  },
  {
    id: "fm3",
    name: "Detox Juice",
    time: "Day After Lunch",
    image: "https://via.placeholder.com/60x60?text=Juice"
  }
];

const FutureMeals: React.FC = () => (
  <div style={{ margin: '24px 16px 0 16px' }}>
    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Future Meals</h3>
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
      {futureMeals.map(meal => (
        <div key={meal.id} style={{ minWidth: 120, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={meal.image} alt={meal.name} style={{ width: 60, height: 60, borderRadius: 8, marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{meal.name}</div>
          <div style={{ color: '#666', fontSize: '0.92rem' }}>{meal.time}</div>
        </div>
      ))}
    </div>
  </div>
);

export default FutureMeals;
