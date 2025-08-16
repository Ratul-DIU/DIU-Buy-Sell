import Head from 'next/head';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useEffect, useState, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categories, setCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const productsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(productsData);
      
      const prices = productsData.map(p => p.price || 0);
      const calculatedMax = Math.max(100000, ...prices);
      setMaxPrice(calculatedMax);
      setPriceRange([0, calculatedMax]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    setCategories(['All', ...uniqueCategories]);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesPrice = (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1];
      const matchesSearch = !searchTerm || 
        p.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [products, selectedCategory, priceRange, searchTerm]);

  const handlePriceChange = (e, index) => {
    const value = parseInt(e.target.value);
    const newPriceRange = [...priceRange];
    newPriceRange[index] = value;
    
    // Prevent crossing
    if (index === 0 && value > priceRange[1]) {
      newPriceRange[1] = value;
    } else if (index === 1 && value < priceRange[0]) {
      newPriceRange[0] = value;
    }
    
    setPriceRange(newPriceRange);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price) + ' BDT';
  };

  return (
    <>
      <Head>
        <title>DIU Buy & Sell | University Marketplace</title>
        <meta name="description" content="Buy and sell products within DIU community" />
      </Head>
      <Header onSearchChange={setSearchTerm} />
      <main className="main-container">
        <h2>Latest Listings</h2>
        
        <div className="filters">
          <div className="filter-group">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-input"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <div className="price-slider-container">
              <div className="slider-wrapper">
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="slider-input"
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="slider-input"
                />
                <div className="slider-track">
                  <div 
                    className="slider-range" 
                    style={{
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / maxPrice) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="price-labels">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} id={p.id} />
            ))
          ) : (
            <p className="no-products">No products match your filters.</p>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>DIU Marketplace</h4>
            <p>Connecting DIU students for buying and selling within campus</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/sell">Sell Item</a></li>
              <li><a href="/categories">Categories</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: marketplace@diu.edu.bd</p>
            <p>DIU Campus, Dhaka</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DIU Buy & Sell Marketplace. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .main-container {
          padding: 0 1rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: calc(100vh - 220px);
          padding-bottom: 2rem;
        }
        
        h2 {
          margin: 1rem 0;
          text-align: center;
          color: #333;
          font-size: 1.8rem;
        }
        
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .filter-group {
          flex: 1;
          min-width: 250px;
        }
        
        .select-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 0.9rem;
        }
        
        .price-slider-container {
          width: 100%;
        }
        
        .slider-wrapper {
          position: relative;
          height: 30px;
          display: flex;
          align-items: center;
        }
        
        .slider-track {
          position: absolute;
          width: 100%;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
        }
        
        .slider-range {
          position: absolute;
          height: 100%;
          background: #0070f3;
          border-radius: 2px;
        }
        
        .slider-input {
          position: absolute;
          width: 100%;
          height: 0;
          pointer-events: none;
          -webkit-appearance: none;
          z-index: 2;
        }
        
        .slider-input::-webkit-slider-thumb {
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0070f3;
          cursor: pointer;
          -webkit-appearance: none;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .price-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #555;
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .no-products {
          grid-column: 1/-1;
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        /* Footer Styles */
        .footer {
          background-color: #2c3e50;
          color: #ecf0f1;
          padding: 2rem 0 0;
          margin-top: 3rem;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        
        .footer-section {
          margin-bottom: 1.5rem;
        }
        
        .footer-section h4 {
          color: #fff;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .footer-section h4::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 2px;
          background: #0070f3;
        }
        
        .footer-section p {
          color: #bdc3c7;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0.5rem 0;
        }
        
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .footer-links li {
          margin-bottom: 0.5rem;
        }
        
        .footer-links a {
          color: #bdc3c7;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        
        .footer-links a:hover {
          color: #0070f3;
        }
        
        .footer-bottom {
          background-color: #1a252f;
          padding: 1rem;
          text-align: center;
          margin-top: 2rem;
        }
        
        .footer-bottom p {
          color: #bdc3c7;
          font-size: 0.8rem;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .main-container {
            min-height: calc(100vh - 240px);
          }
        }
        
        @media (max-width: 600px) {
          .filters {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}