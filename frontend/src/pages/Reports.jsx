import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Printer } from 'lucide-react';

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText size={24} /> Sales Reports & Invoices</h2>
        <button 
          onClick={handlePrint}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 px-5 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Printer size={20} />
          <span>Print Report</span>
        </button>
      </div>

      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-black">TEXTILE STORE INC.</h1>
        <p className="text-gray-500">Sales Report</p>
        <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        <hr className="my-4 border-black" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 print:border-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 font-semibold text-sm border-b border-gray-100 print:bg-white print:text-black">
              <th className="p-4">Invoice No</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Cashier</th>
              <th className="p-4">Method</th>
              <th className="p-4">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors print:border-gray-300">
                <td className="p-4 font-mono text-sm text-gray-800">{order.invoiceNumber}</td>
                <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="p-4 text-gray-800">{order.customer?.name || 'Walk-in'}</td>
                <td className="p-4 text-gray-600 text-sm">{order.createdBy?.name || 'Unknown'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} print:bg-transparent print:p-0`}>
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-800">${order.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white { box-shadow: none !important; border: none !important; }
          .print\\:block, .print\\:block * { visibility: visible; }
          table, table * { visibility: visible; }
          table { position: absolute; left: 0; top: 150px; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
