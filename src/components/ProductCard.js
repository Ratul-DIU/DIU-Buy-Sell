import Link from 'next/link';

export default function ProductCard({ product, id }) {

  // Clean the image URL (remove extra quotes if any)
  const imageUrl = product.image
    ? product.image.replace(/^"+|"+$/g, '') // remove surrounding quotes
    : '/images/placeholder.png';

  return (
    <div className="card">
      <img
        src={imageUrl || '/images/placeholder.png'}
        alt={product.title || 'Product'}
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <h3>{product.title}</h3>
      <p className="small">{product.category} • BDT {product.price}</p>
      <p className="small">{product.contact}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <Link legacyBehavior href={'/products/' + id}>
          <a className="btn">View</a>
        </Link>
        <div className="small">Posted by {product.ownerName || 'User'}</div>
      </div>
    </div>
  );
}
