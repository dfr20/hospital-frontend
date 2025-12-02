import React from 'react';
import Auth from '../Pages/Auth/Auth';
import Users from '../Pages/Users/Users';
import Hospitals from '../Pages/Hospitals/Hospitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobTitles from '../Pages/JobTitles/JobTitles';
import Catalogs from '../Pages/Catalog/Catalog';
import CategoriesWithSubcategories from '../Pages/Categories/CategoriesWithSubcategories';
import ItemsWithEvaluations from '../Pages/Items/ItemsWithEvaluations';
import Suppliers from '../Pages/Suppliers/Suppliers';
import ProtectedRoute from '../Components/Common/ProtectedRoute';
import RedirectToAllowed from '../Components/Common/RedirectToAllowed';
import PublicAcquisitions from '../Pages/PublicAcquisitions/PublicAcquisitions';
import PublicAcquisitionDetails from '../Pages/PublicAcquisitions/PublicAcquisitionDetails';
import Questions from '../Pages/Questions/Questions';

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
              <CategoriesWithSubcategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute requiredPage="/items">
              <ItemsWithEvaluations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute requiredPage="/suppliers">
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/public-acquisitions"
          element={
            <ProtectedRoute requiredPage="/public-acquisitions">
              <PublicAcquisitions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/public-acquisitions/:id"
          element={
            <ProtectedRoute requiredPage="/public-acquisitions">
              <PublicAcquisitionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute requiredPage="/questions">
              <Questions />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;