import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, FileText, X } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['Admin'] },
    { name: 'POS Console', path: '/pos', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Cashier'] },
    { name: 'Products', path: '/products', icon: <Package size={20} />, roles: ['Admin'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['Admin', 'Cashier'] },
    { name: 'Orders & Reports', path: '/reports', icon: <FileText size={20} />, roles: ['Admin'] },
  ];

  const visibleItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-4 lg:justify-center">
        <div className="text-2xl font-bold text-blue-400">ඉලන්දාරියා</div>
        <button onClick={closeSidebar} className="lg:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {visibleItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
