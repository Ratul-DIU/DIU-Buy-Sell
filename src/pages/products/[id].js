import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ProductDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [product,setProduct]=useState(null);

  useEffect(()=>{
    if(!id) return;
    const d = doc(db,'products',id);
    const unsub = onSnapshot(d,(snap)=>{
      if(!snap.exists()) return setProduct(null);
      setProduct({...snap.data(), id: snap.id});
    });
    return ()=>unsub();
  },[id]);

  if(!product) return (
    <>
      <Header />
      <div>Loading...</div>
    </>
  );

  return (
    <>
      <Header />
      <main>
        <h2>{product.title}</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>
          <div>
            <img src={product.image || '/images/placeholder.png'} style={{width:'100%',borderRadius:12}} />
            <p className="small">{product.description}</p>
          </div>
          <aside className="card">
            <h3>BDT {product.price}</h3>
            <p className="small">Category: {product.category}</p>
            <p className="small">Contact: {product.contact}</p>
            <p className="small">Seller: {product.ownerName || 'User'}</p>
          </aside>
        </div>
      </main>
    </>
  )
}
