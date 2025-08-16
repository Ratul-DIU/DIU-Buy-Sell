import Head from 'next/head';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function Home(){
  const [products, setProducts] = useState([]);

  useEffect(()=>{
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap)=>{
      setProducts(snap.docs.map(d=>({id:d.id, ...d.data()})));
    });
    return ()=>unsub();
  },[]);

  return (
    <>
      <Header />
      <main>
        <h1>Latest Listings</h1>
        <div className="grid">
          {products.map(p=>(
            <ProductCard key={p.id} product={p} id={p.id} />
          ))}
        </div>
        <div className="footer">Made for DIU students • Sage </div>
      </main>
    </>
  );
}
