import Header from '../components/Header';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login(){
  const [email,setEmail]=useState(''); const [pass,setPass]=useState('');
  const router = useRouter();
  const [err,setErr]=useState(null);
  async function submit(e){
    e.preventDefault();
    try{
      await signInWithEmailAndPassword(auth,email,pass);
      router.push('/');
    }catch(error){
      setErr(error.message);
    }
  }
  return (
    <>
      <Header />
      <main>
        <h2>Login</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <button className="btn" type="submit">Login</button>
          {err && <div className="small" style={{color:'tomato'}}>{err}</div>}
          <div className="small">Don't have account? <Link legacyBehavior href="/register"><a>Register</a></Link></div>
        </form>
      </main>
    </>
  );
}
