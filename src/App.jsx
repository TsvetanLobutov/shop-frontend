import { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Review Form State
  const [reviewUsername, setReviewUsername] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

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
    // Fetching reviews for product 1 just for the demo
    fetch(`${API_URL}/api/reviews/product/1`)
      .then(response => response.json())
      .then(data => setReviews(data))
      .catch(error => console.error("Error fetching reviews:", error));
  };

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, []);

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
      productId: 1, // Hardcoded to product 1 for this demo
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderRequest),
    }).then(response => {
      if (response.ok) {
        alert(`Bought 1 ${product.name}!`);
        setTimeout(fetchProducts, 1000); 
      } else {
        alert("Failed to place order.");
      }
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🐾 Pet Shop Inventory</h1>
      
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