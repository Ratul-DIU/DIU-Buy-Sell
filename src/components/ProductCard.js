import Link from 'next/link';

export default function ProductCard({product, id}){
  return (
    <div className="card">
      <img src={product.image || '/images/placeholder.png'} alt={product.title} />
      <h3>{product.title}</h3>
      <p className="small">{product.category} • BDT {product.price}</p>
      <p className="small">{product.contact}</p>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
        <Link legacyBehavior href={'/products/' + id}><a className="btn">View</a></Link>
        <div className="small">Posted by {product.ownerName || 'User'}</div>
      </div>
    </div>
  )
}
