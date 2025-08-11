import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard(){
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'products'), where('owner','==', user.uid));
    const unsub = onSnapshot(q, snap=> setPosts(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return ()=>unsub();
  },[user]);

  async function remove(id){
    if(!confirm('Delete this post?')) return;
    await deleteDoc(doc(db,'products',id));
  }

  if(loading) return <div>Loading...</div>
  if(!user) return (
    <>
      <Header />
      <div>Please login to view dashboard</div>
    </>
  );

  return (
    <>
      <Header />
      <main>
        <h2>Your Posts</h2>
        <div className="grid">
          {posts.map(p=>(
            <div key={p.id} className="card">
              <img src={p.image || '/images/placeholder.png'} />
              <h3>{p.title}</h3>
              <div style={{display:'flex',gap:8}}>
                <button className="btn" onClick={()=>remove(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
