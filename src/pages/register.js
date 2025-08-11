import Header from '../components/Header';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useRouter } from 'next/router';
import { doc, setDoc } from 'firebase/firestore';

export default function Register(){
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [name,setName]=useState('');
  const router = useRouter(); const [err,setErr]=useState(null);

  async function submit(e){
    e.preventDefault();
    try{
      const res = await createUserWithEmailAndPassword(auth,email,pass);
      await updateProfile(res.user, { displayName: name });
      // save basic user in firestore
      await setDoc(doc(db,'users',res.user.uid), { name, email, createdAt: new Date().toISOString() });
      router.push('/');
    }catch(error){
      setErr(error.message);
    }
  }

  return (
    <>
      <Header />
      <main>
        <h2>Register</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="btn" type="submit">Register</button>
          {err && <div className="small" style={{color:'tomato'}}>{err}</div>}
        </form>
      </main>
    </>
  );
}
