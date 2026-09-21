import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import SearchBar from "./components/SearchBar";
import RestaurantGrid from "./components/RestaurantGrid";
import GrowWithAI from "./components/GrowWithAI";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <NavBar />
      <Hero />
      <SearchBar />
      <RestaurantGrid />
      <GrowWithAI />
      <Footer />
    </>
  );
}