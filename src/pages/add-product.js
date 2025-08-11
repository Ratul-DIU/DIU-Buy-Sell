import Header from '../components/Header';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function AddProduct(){
  const { user } = useAuth();
  const router = useRouter();
  const [title,setTitle]=useState(''); const [desc,setDesc]=useState(''); const [price,setPrice]=useState(''); const [category,setCategory]=useState('Other'); const [contact,setContact]=useState(''); const [file,setFile]=useState(null);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState(null);

  async function submit(e){
    e.preventDefault();
    if(!user){ setErr('Please login to post'); return; }
    setLoading(true);
    try{
      let imageUrl = '';
      if(file){
        const storageRef = ref(storage, `products/${user.uid}_${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        imageUrl = await getDownloadURL(uploadTask.ref);
      }
      await addDoc(collection(db,'products'), {
        title, description: desc, price: Number(price || 0), category, contact, image: imageUrl,
        owner: user.uid, ownerName: user.displayName || '', createdAt: serverTimestamp()
      });
      router.push('/');
    }catch(e){
      setErr(e.message);
    }finally{ setLoading(false); }
  }

  return (
    <>
      <Header />
      <main>
        <h2>Add Product</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <input className="input" placeholder="Price (BDT)" value={price} onChange={e=>setPrice(e.target.value)} />
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option>Electronics</option><option>Books</option><option>Furniture</option><option>Clothing</option><option>Other</option>
          </select>
          <input className="input" placeholder="Contact (phone or email)" value={contact} onChange={e=>setContact(e.target.value)} />
          <input type="file" onChange={e=>setFile(e.target.files?.[0])} />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
          {err && <div className="small" style={{color:'tomato'}}>{err}</div>}
        </form>
      </main>
    </>
  );
}
