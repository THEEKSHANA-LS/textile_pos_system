import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingBag } from 'lucide-react';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

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
    if (product.stock === 0) return alert('Out of stock');
    
    const existItem = cart.find((x) => x.product === product._id);
    if (existItem) {
      if (existItem.quantity >= product.stock) return alert('Max stock reached');
      setCart(cart.map((x) => x.product === product._id ? { ...existItem, quantity: existItem.quantity + 1, subtotal: (existItem.quantity + 1) * existItem.price } : x));
    } else {
      setCart([...cart, { product: product._id, name: product.name, price: product.price, quantity: 1, subtotal: product.price }]);
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
    if (newQty > product.stock) return alert('Max stock reached');
    
    setCart(cart.map((x) => x.product === id ? { ...existItem, quantity: newQty, subtotal: newQty * existItem.price } : x));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = subtotal * 0.1; // 10% tax example
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const orderData = {
        customerId: selectedCustomer || null,
        orderItems: cart,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        totalPrice: total,
      };
      await api.post('/orders', orderData);
      alert('Order placed successfully!');
      setCart([]);
      setSelectedCustomer('');
      fetchProducts(); // refresh stock
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 font-medium placeholder-gray-400 transition-shadow"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => addToCart(product)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all duration-200 ${product.stock === 0 ? 'opacity-50 grayscale' : 'hover:scale-[1.02] hover:shadow-lg bg-white border border-gray-100 hover:border-blue-200'}`}
              >
                <div className="aspect-square bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 transition-colors">
                  <ShoppingBag size={40} className={product.stock > 0 ? "group-hover:text-blue-300" : ""} />
                </div>
                <h4 className="font-bold text-gray-800 truncate mb-1">{product.name}</h4>
                <div className="flex justify-between items-end">
                  <span className="text-lg text-blue-600 font-black tracking-tight">${product.price.toFixed(2)}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${product.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{cart.length} items</span>
        </div>
        
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <select 
            value={selectedCustomer} 
            onChange={e => setSelectedCustomer(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700 cursor-pointer shadow-sm"
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p className="font-medium">Cart is empty</p>
            </div>
          ) : (
            <div className="px-2 space-y-3 pt-2">
              {cart.map(item => (
                <div key={item.product} className="flex flex-col p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-2">{item.name}</h4>
                    <button onClick={() => removeFromCart(item.product)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-gray-500 text-xs font-semibold">${item.price.toFixed(2)} / ea</div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-black text-gray-800">${item.subtotal.toFixed(2)}</div>
                      <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-0.5 shadow-sm">
                        <button onClick={() => changeQuantity(item.product, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.product, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="space-y-3 mb-6 text-sm font-medium">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-black text-2xl text-gray-900 pt-3 border-t border-dashed border-gray-200 mt-2"><span>Total</span><span className="text-blue-600">${total.toFixed(2)}</span></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => setPaymentMethod('Cash')}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 border-2 font-bold transition-all ${paymentMethod === 'Cash' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <Banknote size={20} /> CASH
            </button>
            <button 
              onClick={() => setPaymentMethod('Card')}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 border-2 font-bold transition-all ${paymentMethod === 'Card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <CreditCard size={20} /> CARD
            </button>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-black text-lg text-white shadow-lg flex items-center justify-center transition-all transform ${cart.length === 0 ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/30'}`}
          >
            PAY ${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
