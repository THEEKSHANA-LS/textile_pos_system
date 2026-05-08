import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  const fetchCustomers = async () => {
    const { data } = await api.get('/customers');
    setCustomers(data);
  };

  const addToCart = (product) => {
    if (product.stock === 0) return toast.error('Out of stock');

    const existItem = cart.find((x) => x.product === product._id);
    if (existItem) {
      if (existItem.quantity >= product.stock) return toast.error('Max stock reached');
      setCart(cart.map((x) => x.product === product._id ? { ...existItem, quantity: existItem.quantity + 1, subtotal: (existItem.quantity + 1) * existItem.price } : x));
    } else {
      setCart([...cart, { product: product._id, name: product.name, price: product.price, quantity: 1, subtotal: product.price, image: product.image }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((x) => x.product !== id));
  };

  const changeQuantity = (id, delta) => {
    const existItem = cart.find((x) => x.product === id);
    if (!existItem) return;
    const product = products.find(p => p._id === id);
    const newQty = existItem.quantity + delta;

    if (newQty <= 0) return removeFromCart(id);
    if (newQty > product.stock) return toast.error('Max stock reached');

    setCart(cart.map((x) => x.product === id ? { ...existItem, quantity: newQty, subtotal: newQty * existItem.price } : x));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        customerId: selectedCustomer || null,
        orderItems: cart,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: 0,
        totalPrice: total,
        discount,
      };
      const { data } = await api.post('/orders', orderData);
      setLastOrder(data);
      setCart([]);
      setSelectedCustomer('');
      setDiscount(0);
      fetchProducts(); // refresh stock
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing order');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-100px)] gap-4 md:gap-6 overflow-y-auto lg:overflow-hidden">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] lg:min-h-0">
        <div className="p-4 md:p-5 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 font-medium placeholder-gray-400 transition-shadow text-sm md:text-base"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`group p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-200 ${product.stock === 0 ? 'opacity-50 grayscale' : 'hover:scale-[1.02] hover:shadow-lg bg-white border border-gray-100 hover:border-blue-200'}`}
              >
                <div className="aspect-square bg-gray-50 rounded-xl mb-3 md:mb-4 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 transition-all overflow-hidden border border-gray-100">
                  {product.image ? (
                    <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <ShoppingBag size={32} className={product.stock > 0 ? "group-hover:text-blue-300 md:w-10 md:h-10" : ""} />
                  )}
                </div>
                <h4 className="font-bold text-gray-800 truncate mb-1 text-sm md:text-base">{product.name}</h4>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1">
                  <span className="text-sm md:text-lg text-blue-600 font-black tracking-tight">Rs. {product.price.toFixed(2)}</span>
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-md ${product.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:h-full">
        <div className="p-4 md:p-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Current Order</h2>
          <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full">{cart.length} items</span>
        </div>

        <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50/50">
          <select
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
            className="w-full p-2 md:p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm font-medium text-gray-700 cursor-pointer shadow-sm"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-[200px] lg:min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-8 lg:py-0">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="font-medium">Cart is empty</p>
            </div>
          ) : (
            <div className="px-2 space-y-3 pt-2">
              {cart.map(item => (
                <div key={item.product} className="flex flex-col p-2 md:p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white shadow-sm">
                  <div className="flex gap-2 md:gap-3 mb-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><ShoppingBag size={14} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs md:text-sm text-gray-800 line-clamp-1 md:line-clamp-2">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.product)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={14} md:size={16} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-gray-500 text-[10px] md:text-xs font-semibold">Rs. {item.price.toFixed(2)} / ea</div>
                    <div className="flex flex-col items-end gap-1 md:gap-2">
                      <div className="font-black text-sm md:text-base text-gray-800">Rs. {item.subtotal.toFixed(2)}</div>
                      <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => changeQuantity(item.product, -1)} className="p-0.5 md:p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"><Minus size={12} md:size={14} /></button>
                        <span className="w-6 md:w-8 text-center text-xs md:text-sm font-bold text-gray-800">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.product, 1)} className="p-0.5 md:p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"><Plus size={12} md:size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 bg-white">
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 text-xs md:text-sm font-medium">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500 items-center">
              <span>Discount</span>
              <div className="flex items-center">
                <span className="text-gray-400 mr-1">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-16 md:w-20 p-1 border border-gray-200 rounded text-right outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>
            <div className="flex justify-between font-black text-xl md:text-2xl text-gray-900 pt-2 md:pt-3 border-t border-dashed border-gray-200 mt-2"><span>Total</span><span className="text-blue-600">Rs. {total.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
            <button
              onClick={() => setPaymentMethod('Cash')}
              className={`py-2 md:py-3 rounded-xl flex items-center justify-center gap-2 border-2 font-bold transition-all text-sm md:text-base ${paymentMethod === 'Cash' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <Banknote size={18} md:size={20} /> CASH
            </button>
            <button
              onClick={() => setPaymentMethod('Card')}
              className={`py-2 md:py-3 rounded-xl flex items-center justify-center gap-2 border-2 font-bold transition-all text-sm md:text-base ${paymentMethod === 'Card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <CreditCard size={18} md:size={20} /> CARD
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 md:py-4 rounded-xl font-black text-base md:text-lg text-white shadow-lg flex items-center justify-center transition-all transform ${cart.length === 0 ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/30'}`}
          >
            PAY Rs. {total.toFixed(2)}
          </button>
        </div>
      </div>
      {/* Invoice Modal */}
      {lastOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-transparent print:backdrop-blur-none">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] flex flex-col print:shadow-none print:p-0 print:m-0">

            <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 print:overflow-visible">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-gray-900">ඉලන්දාරියා</h1>
                <p className="text-sm text-gray-500">New Town Embilipitiya</p>
                <p className="text-sm text-gray-500">Phone: (123) 456-7890</p>
                <div className="mt-4 border-t border-b border-dashed py-2">
                  <h2 className="font-bold text-lg tracking-widest">INVOICE</h2>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-4 grid grid-cols-2 gap-2">
                <div>
                  <p><span className="font-semibold">Invoice No:</span> {lastOrder.invoiceNumber}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(lastOrder.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Time:</span> {new Date(lastOrder.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">Customer:</span> {lastOrder.customer ? customers.find(c => c._id === lastOrder.customer)?.name || 'Walk-in' : 'Walk-in'}</p>
                  <p><span className="font-semibold">Payment:</span> {lastOrder.paymentMethod}</p>
                </div>
              </div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 text-left font-semibold text-gray-700">Item</th>
                    <th className="py-2 text-center font-semibold text-gray-700">Qty</th>
                    <th className="py-2 text-right font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lastOrder.items.map((item, index) => (
                    <tr key={index} className="border-b border-dashed border-gray-200">
                      <td className="py-2 text-gray-800">{item.name} <br /><span className="text-xs text-gray-500">@ Rs. {item.price.toFixed(2)}</span></td>
                      <td className="py-2 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-800">Rs. {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between"><span>Subtotal:</span> <span>Rs. {(lastOrder.items.reduce((a, b) => a + b.subtotal, 0)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount:</span> <span>-Rs. {lastOrder.discount.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-gray-300 text-gray-900">
                  <span>TOTAL:</span> <span>Rs. {lastOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Thank you for shopping with us!</p>
                <p>Please visit again.</p>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-3 print:hidden mt-auto">
              <button
                onClick={() => setLastOrder(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2"
              >
                Print Invoice
              </button>
            </div>
          </div>

          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-invoice, #printable-invoice * { visibility: visible; }
              #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default POS;
