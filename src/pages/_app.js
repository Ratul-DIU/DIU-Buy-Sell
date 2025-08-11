import '../styles/globals.css';

import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }){
  return (
    <AuthProvider>
      <Head>
        <title>DIU Buy & Sell</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}

export default MyApp;
