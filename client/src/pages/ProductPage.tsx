import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';

// 1. Define the Product Interface based on your data structure
interface Product {
  id: number;
  img: string;
  price: string;
  oldPrice: string;
  discount: string;
  name?: string;        // Optional if not in all items
  description?: string; // Optional
  category?: string;    // Optional
}

const ProductPage: React.FC = () => {
  // 2. Type the useParams hook
  const { id } = useParams<{ id: string }>();

  // 3. Find product with type safety
  const product: Product | undefined = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white text-2xl font-light">
        Product not found
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-12 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">
        
        {/* Left: Image Section */}
        <div className="md:w-1/2 lg:w-[55%]">
          <div className="sticky top-24">
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src={product.img}
                alt={product.name || "Product image"}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="md:w-1/2 lg:w-[45%] flex flex-col">
          <nav className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-widest">
            Products / {product.category || 'Collection'}
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">
            {product.name || "Premium Selection"}
          </h1>

          <div className="flex items-center gap-4 my-6">
            <span className="text-4xl font-bold text-white tracking-tight">
              {product.price}
            </span>
            <div className="flex flex-col">
              <span className="text-slate-500 line-through text-sm leading-none">
                {product.oldPrice}
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                Save {product.discount}
              </span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed mb-8 border-t border-slate-800 pt-6">
            {product.description || "Designed for high-performance and durability. This item features premium materials crafted to ensure longevity and style in any environment."}
          </p>

          <div className="space-y-4">
            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              ADD TO CART
            </button>
            <button className="w-full border border-slate-700 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98]">
              ADD TO WISHLIST
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mt-10">
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 text-xs text-slate-400 flex items-center justify-center gap-2">
              <span>⚡</span> Free Express Delivery
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 text-xs text-slate-400 flex items-center justify-center gap-2">
              <span>🛡️</span> 1 Year Warranty
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;