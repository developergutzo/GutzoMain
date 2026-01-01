import React from "react";

const VendorDetailsPage: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: window.innerWidth >= 1024 ? "800px" : "100%",
        margin: window.innerWidth >= 1024 ? "0 auto" : undefined,
        padding: window.innerWidth >= 1024 ? "0 16px" : "0",
      }}
    >
      {children}
    </div>
  );
};

export default VendorDetailsPage;
