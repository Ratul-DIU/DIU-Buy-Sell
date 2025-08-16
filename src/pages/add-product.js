import Header from '../components/Header';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function AddProduct() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [contact, setContact] = useState('');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function submit(e) {
    e.preventDefault();
    if (!user) { 
      setErr('Please login to post'); 
      return; 
    }
    
    setLoading(true);
    setErr(null);
    setUploadProgress(0);
    
    try {
      let finalImageUrl = '';
      
      if (activeTab === 'upload' && file) {
        // Handle file upload with progress tracking
        const storageRef = ref(storage, `products/${user.uid}_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Create a promise to handle the upload completion
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                finalImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(finalImageUrl);
              } catch (error) {
                reject(error);
              }
            }
          );
        });

      } else if (activeTab === 'url' && imageUrl) {
        // Basic URL validation
        if (!imageUrl.match(/^https?:\/\/.+\..+$/)) {
          throw new Error('Please enter a valid image URL');
        }
        finalImageUrl = imageUrl.trim();
      } else {
        throw new Error('Please add an image or URL');
      }

      // Save product to Firestore
      await addDoc(collection(db, 'products'), {
        title,
        description: desc,
        price: Number(price || 0),
        category,
        contact,
        image: finalImageUrl,
        owner: user.uid,
        ownerName: user.displayName || '',
        createdAt: serverTimestamp()
      });

      // Reset form and redirect
      setTitle('');
      setDesc('');
      setPrice('');
      setCategory('Other');
      setContact('');
      setFile(null);
      setImageUrl('');
      setUploadProgress(0);
      
      router.push('/');

    } catch (error) {
      console.error('Error adding product:', error);
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <h2>Add Product</h2>
        <form className="form" onSubmit={submit}>
          <input 
            className="input" 
            placeholder="Title" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
          <textarea 
            className="input" 
            placeholder="Description" 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            required 
          />
          <input 
            className="input" 
            placeholder="Price (BDT)" 
            value={price} 
            onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))} 
            type="number"
            required 
          />
          <select 
            className="input" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            required
          >
            <option>Electronics</option>
            <option>Books</option>
            <option>Furniture</option>
            <option>Clothing</option>
            <option>Other</option>
          </select>
          <input 
            className="input" 
            placeholder="Contact (phone or email)" 
            value={contact} 
            onChange={e => setContact(e.target.value)} 
            required 
          />

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
                disabled={loading}
              >
                Upload Image
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
                onClick={() => setActiveTab('url')}
                disabled={loading}
              >
                Add Image URL
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files?.[0])}
                  required={activeTab === 'upload'}
                  disabled={loading}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
                    <p>Uploading: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
              </div>
            ) : (
              <input
                className="input"
                placeholder="Image URL (https://example.com/image.jpg)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                type="url"
                required={activeTab === 'url'}
                disabled={loading}
              />
            )}
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
          {err && <div className="small" style={{ color: 'tomato' }}>{err}</div>}
        </form>
      </main>

      <style jsx>{`
        .tab-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          border: none;
          cursor: pointer;
          margin-right: 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        .tab-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .tab-btn.active {
          background: #0070f3;
          color: white;
        }
        progress {
          margin-top: 8px;
          height: 8px;
          border-radius: 4px;
        }
        progress::-webkit-progress-bar {
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        progress::-webkit-progress-value {
          background-color: #0070f3;
          border-radius: 4px;
        }
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}