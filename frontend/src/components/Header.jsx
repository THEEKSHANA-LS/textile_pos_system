import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Clock, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate max-w-[150px] md:max-w-none">
          Welcome, {user?.name}
        </h2>
      </div>

      <div className="flex items-center space-x-2 md:space-x-6">
        <div className="hidden sm:flex items-center space-x-2 text-gray-500 text-xs md:text-sm font-medium whitespace-nowrap bg-gray-50 px-3 md:px-4 py-2 rounded-xl border border-gray-100">
          <Clock size={16} className="text-blue-500" />
          <span className="hidden md:inline">{currentTime.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="hidden md:inline mx-1 border-r border-gray-300 h-4"></span>
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 border-l border-gray-200 pl-2 md:pl-6">
          <div className="flex items-center space-x-1 md:space-x-2 text-gray-600">
            <User size={18} className="hidden xs:block" />
            <span className="font-medium text-[10px] md:text-sm bg-blue-100 text-blue-800 px-2 md:px-3 py-0.5 md:py-1 rounded-full whitespace-nowrap">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 md:space-x-2 text-red-500 hover:text-red-700 font-medium transition-colors text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
