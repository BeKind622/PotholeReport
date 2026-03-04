// import { useState } from "react";
// import TrafficCone from "./assets/TrafficCone";
import ReportPage from "./ReportPage";
export default function App() {
 
  return (
 
 <>
 <div className="screen" style={{
    minHeight: "100vh",
    maxWidth: "480px",
    margin: "0 auto",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowX: "hidden"}}>
  <ReportPage />
  </div>
  </>
  );
}