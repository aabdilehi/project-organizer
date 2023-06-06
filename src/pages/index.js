import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import { useState, useEffect } from "react";

const Bruh = () => {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  if (isLoading) {
    return "Loading";
  } else {
    return (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

export default Bruh;
