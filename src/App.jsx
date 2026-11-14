import { useEffect, useState } from 'react';
import Login from './Login'; // Import the new Login component

function App() {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');
  
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [reviewUsername, setReviewUsername] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // State for simulated notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  };

  const fetchReviews = () => {
    fetch(`${API_URL}/api/reviews/product/1`)
      .then(response => response.json())
      .then(data => setReviews(data))
      .catch(error => console.error("Error fetching reviews:", error));
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchReviews();
    }
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('jwtToken', newToken);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('jwtToken');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      name: name,
      description: description,
      price: parseFloat(price),
      stockQuantity: parseInt(stock)
    };

    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).then(response => {
      if (response.ok) {
        setName(''); setDescription(''); setPrice(''); setStock('');
        fetchProducts();
      }
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const newReview = {
      productId: 1,
      username: reviewUsername,
      rating: parseInt(reviewRating),
      comment: reviewComment,
      tags: ["from-ui"]
    };

    fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    }).then(response => {
      if (response.ok) {
        setReviewUsername(''); setReviewRating(5); setReviewComment('');
        fetchReviews();
      }
    });
  };

  const handleBuy = (product) => {
    const orderRequest = {
      productId: product.id,
      quantity: 1,
      price: product.price
    };

    fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderRequest),
    }).then(response => {
      if (response.ok) {
        alert(`Bought 1 ${product.name}!`);
        
        // ADD THIS: Simulate the notification email
        const newNotif = {
          id: Date.now(),
          message: `📧 Order Confirmed: 1x ${product.name} purchased for $${product.price}.`,
          time: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [newNotif, ...prev]);

        setTimeout(fetchProducts, 1000); 
      } else if (response.status === 401) {
        alert("Session expired. Please log in again.");
        handleLogout();
      } else {
        alert("Failed to place order.");
      }
    });
  };

  // 👇 THIS IS THE MISSING PART YOU WERE LOOKING FOR 👇
  // If the token is empty, render the Login component instead of the store.
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // This is the main return for the store
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* UPDATED HEADER WITH NOTIFICATION BELL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🐾 Pet Shop Inventory</h1>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '40px', width: '300px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10 }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Simulated Emails</div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#888' }}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                      <p style={{ margin: '0 0 5px 0' }}>{n.message}</p>
                      <small style={{ color: '#888' }}>{n.time}</small>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
      
      {/* Add Product Form */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px', flex: '1' }} />
          <input type="text" placeholder="Description" required value={description} onChange={(e) => setDescription(e.target.value)} style={{ padding: '8px', flex: '2' }} />
          <input type="number" step="0.01" placeholder="Price" required value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: '8px', width: '100px' }} />
          <input type="number" placeholder="Stock" required value={stock} onChange={(e) => setStock(e.target.value)} style={{ padding: '8px', width: '100px' }} />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Product</button>
        </form>
      </div>

      {/* Product List */}
      {loading ? (
        <h2>Loading products...</h2>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
              <h3>{product.name}</h3>
              <p style={{ color: '#555', flexGrow: '1' }}>{product.description}</p>
              <p><strong>Price: ${product.price}</strong></p>
              <p>In Stock: {product.stockQuantity}</p>
              
              <button 
                onClick={() => handleBuy(product)}
                disabled={product.stockQuantity <= 0}
                style={{ padding: '10px', marginTop: '10px', backgroundColor: product.stockQuantity > 0 ? '#007BFF' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: product.stockQuantity > 0 ? 'pointer' : 'not-allowed' }}
              >
                {product.stockQuantity > 0 ? 'Buy 1' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
        <h2>⭐ Reviews for "Premium Dog Food"</h2>
        
        {/* Add Review Form */}
        <div style={{ backgroundColor: '#eef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Write a Review</h3>
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Your Name" required value={reviewUsername} onChange={(e) => setReviewUsername(e.target.value)} style={{ padding: '8px', flex: '1' }} />
            <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} style={{ padding: '8px' }}>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <input type="text" placeholder="Your Comment" required value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ padding: '8px', flex: '2' }} />
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Review</button>
          </form>
        </div>

        {/* Display Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reviews.length === 0 ? <p>No reviews yet. Be the first!</p> : 
            reviews.map(review => (
              <div key={review.id} style={{ borderLeft: '4px solid #FF9800', padding: '10px 15px', backgroundColor: '#fafafa' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>{review.username} - {review.rating} ⭐</h4>
                <p style={{ margin: '0 0 5px 0' }}>"{review.comment}"</p>
                <small style={{ color: '#888' }}>{review.createdAt}</small>
              </div>
            ))
          }
        </div>
      </div>

    </div>
  );
}

export default App;