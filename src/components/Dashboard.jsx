import { NavLink } from 'react-router-dom';
import { FaPlane, FaClock, FaWallet } from 'react-icons/fa';

const Dashboard = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Travel Planner</h1>
        </div>
        <nav className="mt-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center px-6 py-4 ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`
            }
          >
            <FaPlane className="mr-3" />
            Trip Planning
          </NavLink>
          <NavLink
            to="/timetable"
            className={({ isActive }) =>
              `flex items-center px-6 py-4 ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`
            }
          >
            <FaClock className="mr-3" />
            Time Table
          </NavLink>
          <NavLink
            to="/budgeting"
            className={({ isActive }) =>
              `flex items-center px-6 py-4 ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`
            }
          >
            <FaWallet className="mr-3" />
            Budgeting
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
};

export default Dashboard;
