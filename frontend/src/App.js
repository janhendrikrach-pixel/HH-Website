import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./lib/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import AdminPage from "./pages/AdminPage";
import DynamicPage from "./pages/DynamicPage";

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}

export default App;
