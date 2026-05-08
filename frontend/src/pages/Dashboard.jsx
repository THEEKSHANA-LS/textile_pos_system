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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Today's Revenue" value={`Rs. ${summary?.todayRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp size={28} className="text-emerald-600" />} bgColor="bg-emerald-100" />
        <StatCard title="Monthly Revenue" value={`Rs. ${summary?.monthRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp size={28} className="text-blue-600" />} bgColor="bg-blue-100" />
        <StatCard title="Annual Revenue" value={`Rs. ${summary?.yearRevenue?.toFixed(2) || '0.00'}`} icon={<TrendingUp size={28} className="text-purple-600" />} bgColor="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Orders" value={summary?.totalOrders || 0} icon={<ShoppingBag size={28} className="text-orange-600" />} bgColor="bg-orange-100" />
        <StatCard title="Total Products" value={summary?.totalProducts || 0} icon={<Package size={28} className="text-indigo-600" />} bgColor="bg-indigo-100" />
        <StatCard title="Total Customers" value={summary?.totalCustomers || 0} icon={<Users size={28} className="text-rose-600" />} bgColor="bg-rose-100" />
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
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rs. ${val}`} tick={{ fill: '#6b7280' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`Rs. ${value}`, 'Sales']}
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
      
      {/* Recent Transactions Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors">View All Orders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!summary?.recentOrders || summary.recentOrders.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent transactions found.</td>
                </tr>
              )}
              {summary?.recentOrders?.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{order.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">{order.customer?.name || 'Walk-in Customer'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 font-bold">Rs. {order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${order.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'}`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
