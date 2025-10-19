import React from 'react';
import Auth from '../Pages/Auth/Auth';
import Users from '../Pages/Users/Users';
import Hospitals from '../Pages/Hospitals/Hospitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobTitles from '../Pages/JobTitles/JobTitles';
import Catalogs from '../Pages/Catalog/Catalog';
import Categories from '../Pages/Categories/Categories';
import Subcategories from '../Pages/Subcategories/Subcategories';
import Items from '../Pages/Items/Items';
import ProtectedRoute from '../Components/Common/ProtectedRoute';
import RedirectToAllowed from '../Components/Common/RedirectToAllowed';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        {/* Rota padrão após login - redireciona para primeira página permitida */}
        <Route path="/dashboard" element={<RedirectToAllowed />} />

        {/* Rota para Gerente - Cadastro de usuários */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPage="/users">
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Rotas para Desenvolvedor - Cadastro de hospitais e catálogo */}
        <Route
          path="/hospitals"
          element={
            <ProtectedRoute requiredPage="/hospitals">
              <Hospitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-titles"
          element={
            <ProtectedRoute requiredPage="/job-titles">
              <JobTitles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <ProtectedRoute requiredPage="/catalog">
              <Catalogs />
            </ProtectedRoute>
          }
        />

        {/* Rotas para Administrativo e Gerente - Itens, categorias e subcategorias */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute requiredPage="/categories">
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subcategories"
          element={
            <ProtectedRoute requiredPage="/subcategories">
              <Subcategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute requiredPage="/items">
              <Items />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;