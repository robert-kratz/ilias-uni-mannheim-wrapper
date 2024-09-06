import React from "react";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import Settings from "./app/pages/Settings";
import Home from "./app/pages/Home";

const AppRoutes: React.FC = () => (
  <HashRouter basename="/">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
);

export default AppRoutes;
