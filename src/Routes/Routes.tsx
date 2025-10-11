import React from 'react';
import Auth from '../Pages/Auth/Auth';
import Users from '../Pages/Users/Users';
import Hospitals from '../Pages/Hospitals/Hospitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobTitles from '../Pages/JobTitles/JobTitles';
import Catalogs from '../Pages/Catalog/Catalog';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/users" element={<Users />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/job-titles" element={<JobTitles />} />
        <Route path="/catalog" element={<Catalogs />} />
        <Route path ="*" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;