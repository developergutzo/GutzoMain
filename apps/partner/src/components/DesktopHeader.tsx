import React from "react";

const DesktopHeader = () => (
  <div style={{
    display: window.innerWidth >= 1024 ? "flex" : "none",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "16px 0 8px 0",
    background: "transparent",
  }}>
    {/* Logo */}
    <img src="/logo.png" alt="Gutzo Logo" style={{ height: 32, marginRight: 24 }} />
    {/* Location Selector */}
    <div style={{ color: "#E85A1C", fontWeight: 600, marginRight: 24 }}>
      <span>Sulur, Tamil Nadu ▼</span>
    </div>
    {/* Search Bar */}
    <input type="text" placeholder="Search for restaurant, salads or meals" style={{ flex: 1, minWidth: 220, maxWidth: 340, padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", marginRight: 24 }} />
    {/* Cart Icon */}
    <button style={{ background: "none", border: "none", cursor: "pointer", marginRight: 24 }}>
      <img src="/cart-icon.png" alt="Cart" style={{ height: 28 }} />
    </button>
    {/* Login Button */}
    <button style={{ background: "#1BA672", color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
      Login
    </button>
  </div>
);

export default DesktopHeader;
