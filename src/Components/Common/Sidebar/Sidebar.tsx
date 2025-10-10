import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sidebarData, routeToPageId } from './SidebarData';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const LogoIcon = sidebarData.logo.icon;

  // Define o activePage baseado na rota atual
  const currentPageId = routeToPageId[location.pathname] || 'usuarios';
  const [activePage, setActivePage] = useState(currentPageId);

  // Sincroniza o activePage sempre que a rota mudar
  useEffect(() => {
    const pageId = routeToPageId[location.pathname];
    if (pageId) {
      setActivePage(pageId);
    }
  }, [location.pathname]);

  const handlePageChange = (route: string) => {
    navigate(route);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center">
            <LogoIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-800">{sidebarData.logo.title}</h1>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarData.menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.route)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
