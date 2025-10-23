import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import MenuCard from './components/MenuCard';
import CartCard from './components/CartCard';
import PopularDishesCard from './components/PopularDishesCard';
import PeakTimesCard from './components/PeakTimesCard';
import StaleOrdersCard from './components/StaleOrdersCard';
import OrderEventsCard from './components/OrderEventsCard';

const API_BASE_URL = 'http://localhost:3000'; // Update to your backend URL
const socket = io(API_BASE_URL);

function App() {
  const [activeTab, setActiveTab] = useState('orders');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [menuEvents, setMenuEvents] = useState([]);
  const [orderEvents, setOrderEvents] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));

    socket.on('orderCreated', (order) => {
      addOrderEvent('New Order', order);
      if (currentRestaurantId === order.restaurantId) {
        refreshAnalytics();
      }
    });

    socket.on('orderStatusUpdate', (order) => {
      addOrderEvent('Order Status Changed', order);
      if (currentRestaurantId === order.restaurantId) {
        refreshAnalytics();
      }
    });

    socket.on('menuItemCreated', (menuItem) => {
      addMenuEvent('New Menu Item Added', menuItem);
      if (currentRestaurantId === menuItem.restaurantId) {
        setMenuItems([...menuItems, menuItem]);
      }
    });

    socket.on('menuItemUpdated', (menuItem) => {
      addMenuEvent('Menu Item Updated', menuItem);
      if (currentRestaurantId === menuItem.restaurantId) {
        setMenuItems(menuItems.map(m => m.id === menuItem.id ? menuItem : m));
      }
    });

    socket.on('menuItemDeleted', (data) => {
      addMenuEvent('Menu Item Deleted', data);
      if (currentRestaurantId === data.restaurantId) {
        setMenuItems(menuItems.filter(m => m.id !== data.id));
      }
    });

    socket.on('menuItemAvailabilityToggled', (menuItem) => {
      addMenuEvent('Menu Item Availability Changed', menuItem);
      if (currentRestaurantId === menuItem.restaurantId) {
        setMenuItems(menuItems.map(m => m.id === menuItem.id ? menuItem : m));
      }
    });

    loadRestaurants();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('orderCreated');
      socket.off('orderStatusUpdate');
      socket.off('menuItemCreated');
      socket.off('menuItemUpdated');
      socket.off('menuItemDeleted');
      socket.off('menuItemAvailabilityToggled');
    };
  }, [currentRestaurantId]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  };

  const loadMenu = async (restaurantId) => {
    if (!restaurantId) return;
    setCurrentRestaurantId(restaurantId);
    socket.emit('joinRestaurant', { restaurantId });
    try {
      const response = await fetch(`${API_BASE_URL}/menu-items/restaurant/${restaurantId}`);
      const data = await response.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([]);
    }
  };

  const addToCart = (item) => {
    if (!item.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing.quantity > 1) {
        return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.id !== itemId);
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const userId = e.target.userId.value;
    const deliveryAddress = e.target.deliveryAddress.value;
    const phoneNumber = e.target.phoneNumber.value;
    const paymentMethod = e.target.paymentMethod.value;
    const notes = e.target.notes.value;

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          deliveryAddress,
          phoneNumber,
          paymentMethod,
          notes,
          items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
        }),
      });
      const order = await response.json();
      setCart([]);
      setActiveTab('dashboard');
      socket.emit('joinRestaurant', { restaurantId: selectedRestaurant });
      refreshAnalytics();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const refreshAnalytics = async () => {
    if (!currentRestaurantId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/restaurant/${currentRestaurantId}/dashboard`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  const addOrderEvent = (title, data) => {
    setOrderEvents(prev => [...prev, { title, data, time: new Date().toLocaleTimeString() }]);
  };

  const addMenuEvent = (title, data) => {
    setMenuEvents(prev => [...prev, { title, data, time: new Date().toLocaleTimeString() }]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <div className="card mb-4">
        <div className="card-header">
          <h1 className="card-title mb-0">🍕 Real-Time Food Delivery Analytics Platform</h1>
          <div className={`alert ${connectionStatus === 'connected' ? 'alert-success' : 'alert-danger'} mt-2`}>
            {connectionStatus === 'connected' ? 'Connected to server' : 'Disconnected from server'}
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Order Management
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Analytics Dashboard
          </button>
        </li>
      </ul>

      {activeTab === 'orders' && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">📋 Menu Items</h5>
              </div>
              <div className="card-body">
                <select value={selectedRestaurant} onChange={(e) => { setSelectedRestaurant(e.target.value); loadMenu(e.target.value); }} className="form-select mb-3">
                  <option value="">-- Select Restaurant --</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} - {r.address}</option>)}
                </select>
                <div className="events-log mb-3">
                  {menuEvents.slice(-5).map((event, i) => (
                    <div key={i} className="alert alert-warning">
                      {event.time}: {event.title} - {event.data.name}
                    </div>
                  ))}
                </div>
                <div className="row">
                  {menuItems.map(item => (
                    <div key={item.id} className="col-12 mb-3">
                      <MenuCard item={item} onAddToCart={addToCart} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <CartCard cart={cart} totalAmount={totalAmount} onRemoveFromCart={removeFromCart} onPlaceOrder={placeOrder} />
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="row mt-4">
          <div className="col-md-12 mb-3">
            <div className="d-flex gap-2">
              <input type="number" placeholder="Restaurant ID" onChange={(e) => setCurrentRestaurantId(e.target.value)} className="form-control" />
              <button onClick={() => { socket.emit('joinRestaurant', { restaurantId: currentRestaurantId }); refreshAnalytics(); }} className="btn btn-info">
                📊 Connect to Restaurant
              </button>
              <button onClick={refreshAnalytics} className="btn btn-secondary">🔄 Refresh Analytics</button>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <PopularDishesCard dishes={analyticsData.popularDishes} />
          </div>

          <div className="col-md-6 mb-3">
            <PeakTimesCard peakTimes={analyticsData.peakTimes} />
          </div>

          <div className="col-md-6 mb-3">
            <StaleOrdersCard staleOrders={analyticsData.staleOrders} />
          </div>

          <div className="col-md-6 mb-3">
            <OrderEventsCard orderEvents={orderEvents} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;