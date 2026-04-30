import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, FileText } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
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
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8 text-center text-blue-400">ඉලන්දාරියා</div>
      <nav className="flex-1">
        <ul>
          {visibleItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Link
                to={item.path}
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
