import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import RestaurantDetail from "./components/RestaurantDetail";
import OwnerDashboard from "./components/OwnerDashboard";
import Trending from "./components/Trending";
import Home from "./components/Home";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}