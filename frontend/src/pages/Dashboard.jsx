import { useState, useEffect } from 'react';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-8 text-xl font-semibold text-center text-gray-500">Loading Dashboard...</div>;

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${summary?.totalRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp size={28} className="text-emerald-600" />} bgColor="bg-emerald-100" />
        <StatCard title="Total Orders" value={summary?.totalOrders || 0} icon={<ShoppingBag size={28} className="text-blue-600" />} bgColor="bg-blue-100" />
        <StatCard title="Products" value={summary?.totalProducts || 0} icon={<Package size={28} className="text-indigo-600" />} bgColor="bg-indigo-100" />
        <StatCard title="Customers" value={summary?.totalCustomers || 0} icon={<Users size={28} className="text-orange-600" />} bgColor="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Weekly Sales Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fill: '#6b7280' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Low Stock Alerts
          </h3>
          <div className="space-y-4">
            {(!summary?.lowStockProducts || summary.lowStockProducts.length === 0) && (
              <p className="text-gray-500 text-center py-8">All products adequately stocked.</p>
            )}
            {summary?.lowStockProducts?.map(product => (
              <div key={product._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{product.category}</p>
                </div>
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-red-100 inline-flex items-center">
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
      <h4 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h4>
    </div>
    <div className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
