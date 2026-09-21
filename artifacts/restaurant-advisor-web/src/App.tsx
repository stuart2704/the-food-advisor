import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import RestaurantGrid from "./components/RestaurantGrid";
import RestaurantDetail from "./components/RestaurantDetail";
import OwnerDashboard from "./components/OwnerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <RestaurantGrid />
            </>
          }
        />

        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}