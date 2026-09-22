import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RestaurantDetail from "./components/RestaurantDetail";
import OwnerDashboard from "./components/OwnerDashboard";
import Trending from "./components/Trending";
import Home from "./components/Home";
import CityGuide from "./components/CityGuide";
import AdminLogin from "./pages/admin-login";
import AdminLogs from "./pages/admin/logs";

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin/");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/city-guide" element={<CityGuide />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/logs" element={<AdminLogs />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}