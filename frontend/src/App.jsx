import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./App.css";

import Home from "./pages/home.tsx";
import LoginPage from "./pages/user/LoginPage.tsx";
import TransactionHistory from "./pages/transaction/history.tsx";

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
          path="/history"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
