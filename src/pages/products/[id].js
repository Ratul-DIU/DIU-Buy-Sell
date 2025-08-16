import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const d = doc(db, 'products', id);
    const unsub = onSnapshot(d, (snap) => {
      if (!snap.exists()) return setProduct(null);
      setProduct({ ...snap.data(), id: snap.id });
    });
    return () => unsub();
  }, [id]);

  const handleOrder = async () => {
    setLoading(true);
    try {
      // Here you would implement your actual order logic
      // For now we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Order placed for ${product.title}! Seller will contact you soon.`);
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    // This would open a chat interface in a real app
    // For now we'll simulate it with a prompt
    const userMessage = prompt(`Message to seller about ${product.title}:`, 'I am interested in this product...');
    if (userMessage) {
      setMessage(userMessage);
      alert(`Message sent to seller! They'll respond to ${product.contact}`);
    }
  };

  if (!product) return (
    <>
      <Header />
      <div>Loading...</div>
    </>
  );

  return (
    <>
      <Header />
      <main className="product-detail-container">
        <h2>{product.title}</h2>
        <div className="product-grid">
          <div className="product-main">
            <img 
              src={product.image || '/images/placeholder.png'} 
              alt={product.title} 
              className="product-image" 
            />
            <p className="product-description">{product.description}</p>
          </div>
          
          <aside className="product-sidebar">
            <div className="price-card">
              <h3>BDT {product.price}</h3>
              <p className="meta-info">Category: {product.category}</p>
              <p className="meta-info">Contact: {product.contact}</p>
              <p className="meta-info">Seller: {product.ownerName || 'User'}</p>
              
              <div className="action-buttons">
                <button 
                  onClick={handleOrder} 
                  disabled={loading}
                  className="order-button"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
                
                <button 
                  onClick={handleChat}
                  className="chat-button"
                >
                  Chat with Seller
                </button>
              </div>
            </div>
            
            {message && (
              <div className="message-confirmation">
                <p>Your message: "{message}"</p>
              </div>
            )}
          </aside>
        </div>
      </main>

      <style jsx>{`
        .product-detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          margin-top: 1.5rem;
        }
        
        .product-image {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 1rem;
        }
        
        .product-description {
          color: #555;
          line-height: 1.6;
        }
        
        .product-sidebar {
          position: sticky;
          top: 1rem;
          align-self: start;
        }
        
        .price-card {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .meta-info {
          color: #666;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        
        .order-button, .chat-button {
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .order-button {
          background-color: #0070f3;
          color: white;
        }
        
        .order-button:hover {
          background-color: #0061d5;
        }
        
        .order-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .chat-button {
          background-color: white;
          color: #0070f3;
          border: 1px solid #0070f3;
        }
        
        .chat-button:hover {
          background-color: #f5f9ff;
        }
        
        .message-confirmation {
          margin-top: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
          
          .product-sidebar {
            position: static;
          }
        }
      `}</style>
    </>
  );
}