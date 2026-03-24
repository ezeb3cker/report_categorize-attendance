import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import ReportsDashboard from "./pages/ReportsDashboard";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ReportsDashboard />
  </React.StrictMode>
);

