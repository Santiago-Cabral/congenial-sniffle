// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import { ProductsProvider } from "./Context/ProductsContext";
import { SettingsProvider } from "./Context/SettingContext"; // <-- agregado

import "./index.css";
import { UserAuthProvider } from "./Context/UserAuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserAuthProvider>
        <SettingsProvider>
          <ProductsProvider>
            <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AuthProvider>
          </ProductsProvider>
        </SettingsProvider>
      </UserAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
