import { useEffect, useState } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // Use the environment variable, with a fallback for local development
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  const fetchProducts = () => {
    setLoading(true);
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

  useEffect(() => {
    fetchProducts();
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

  const handleBuy = (product) => {
    const orderRequest = {
      productId: product.id,
      quantity: 1,
      price: product.price
    };

    // Fixed: Now uses API_URL instead of hardcoded localhost
    fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderRequest),
    }).then(response => {
      if (response.ok) {
        alert(`Bought 1 ${product.name}!`);
        setTimeout(fetchProducts, 1000); 
      } else {
        alert("Failed to place order. Are you logged in?");
      }
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🐾 Pet Shop Inventory</h1>
      
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

      {loading ? (
        <h2>Loading products...</h2>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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
    </div>
  );
}

export default App;