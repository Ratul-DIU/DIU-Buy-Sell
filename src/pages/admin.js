import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Admin(){
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,'products'), snap=> setProducts(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return ()=>unsub();
  },[]);

  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

  async function remove(id){
    if(!confirm('Delete post?')) return;
    await deleteDoc(doc(db,'products',id));
  }

  if(loading) return <div>Loading...</div>

  if(!user || user.uid !== ADMIN_UID){
    return (
      <>
        <Header />
        <div className="card">Access denied. Admins only.</div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        <h2>Admin Panel</h2>
        <div className="grid">
          {products.map(p=>(
            <div key={p.id} className="card">
              <img src={p.image || '/images/placeholder.png'} />
              <h3>{p.title}</h3>
              <p className="small">Owner: {p.ownerName || p.owner}</p>
              <div style={{display:'flex',gap:8}}>
                <button className="btn" onClick={()=>remove(p.id)}>Delete Post</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
