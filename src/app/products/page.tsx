'use client';
import { useEffect, useState } from 'react';

interface Product { id: string; name: string; price: number; image: string; stock: number; }

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products?' + new URLSearchParams(search ? { q: search } : {}))
      .then(r => r.json()).then(d => { setProducts(d.products ?? []); setLoading(false); });
  }, [search]);

  return (
    <main className="container mx-auto px-4 py-8">
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search products..." className="w-full border rounded-lg px-4 py-2 mb-6" />
      {loading ? <div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <a key={p.id} href={'/products/' + p.id} className="rounded-xl border hover:shadow-md transition-shadow overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-4"><h3 className="font-semibold">{p.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold">${p.price.toFixed(2)}</span>
                    {p.stock === 0 && <span className="text-xs text-red-500 font-medium">Out of stock</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>}
    </main>
  );
}