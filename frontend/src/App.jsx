import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./App.css";

import Home from "./pages/home.tsx";
import LoginPage from "./pages/user/LoginPage.tsx";
import Profile from "./pages/user/Profile.tsx";
import Statistics from "./pages/Statistics.tsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
