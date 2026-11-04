import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Truck, 
  CreditCard, 
  ArrowRight, 
  Check 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { login, storeSettings, products } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterWithGmail = async () => {
    setIsRegistering(true);
    try {
      await login();
    } finally {
      setIsRegistering(false);
    }
  };

  // Select top 4 products for showcase
  const showcaseProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-900/40 text-amber-200 text-xs py-2 px-4 text-center tracking-wider uppercase font-medium">
        <span>Artisan Extrait de Parfum · 30% Fragrance Oil Concentration · Free Delivery over ₱{storeSettings.freeDeliveryThreshold.toLocaleString()}</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-serif-luxury font-bold tracking-widest text-amber-200">
              HUELO PERFUMES
            </span>
            <span className="hidden sm:inline text-stone-600">|</span>
            <span className="hidden sm:inline text-xs text-stone-400 tracking-wide uppercase">
              Boutique Manila
            </span>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-wider text-stone-300">
            <a href="#about" className="hover:text-amber-300 transition-colors">Our Essence</a>
            <a href="#collection" className="hover:text-amber-300 transition-colors">Signature Scents</a>
            <a href="#benefits" className="hover:text-amber-300 transition-colors">Perks</a>
            <a href="#register" className="hover:text-amber-300 transition-colors">Register</a>
          </nav>

          {/* Direct Registration / Log In CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegisterWithGmail}
              disabled={isRegistering}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-6.1z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"/>
              </svg>
              <span>{isRegistering ? 'Nagrerehistro...' : 'Mag-register / Mag-Log In'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH GMAIL REGISTRATION CARD */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 border-b border-stone-800" id="about">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand Story & Headline */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300/90 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Exquisite High-Concentration Perfumery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold text-stone-100 leading-[1.1] tracking-tight">
                Where Memory Becomes <span className="italic text-amber-200">Scent.</span>
              </h1>

              <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Mag-register gamit ang iyong Gmail account upang makapasok sa aming eksklusibong perfume boutique. Mag-order ng mga signature scents na may 30% concentration, mabilis na nationwide delivery, at GCash payment verification.
              </p>

              {/* Value Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800 text-xs">
                <div>
                  <div className="font-serif-luxury text-xl font-bold text-amber-300">30%</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">Extrait de Parfum Oil</div>
                </div>
                <div>
                  <div className="font-serif-luxury text-xl font-bold text-amber-300">12+ Hrs</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">Long-Lasting Sillage</div>
                </div>
                <div>
                  <div className="font-serif-luxury text-xl font-bold text-amber-300">₱{storeSettings.standardDeliveryFee}</div>
                  <div className="text-stone-400 text-[11px] mt-0.5">Standard Metro Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Column: Gmail Registration Card */}
            <div className="lg:col-span-5" id="register">
              <div className="bg-stone-900/90 border border-amber-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
                <div className="absolute -top-3 right-6 bg-amber-400 text-stone-950 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
                  Instant Registration
                </div>

                <div className="space-y-5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto text-xl font-bold font-serif-luxury shadow-inner">
                    HP
                  </div>

                  <div>
                    <h2 className="text-2xl font-serif-luxury font-bold text-stone-100">
                      Mag-Register sa HUELO
                    </h2>
                    <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                      Isang click lang gamit ang iyong Gmail. Awtomatikong magkakaroon ng access sa iyong Customer Portal para makapamili at ma-track ang paborito mong mga pabango.
                    </p>
                  </div>

                  {/* Main Gmail Registration Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleRegisterWithGmail}
                      disabled={isRegistering}
                      className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-6.1z"/>
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"/>
                      </svg>
                      <span>{isRegistering ? 'Nagrerehistro...' : 'Mag-register gamit ang Gmail'}</span>
                    </button>
                  </div>

                  {/* Bullet Benefits */}
                  <div className="space-y-2.5 pt-4 text-left border-t border-stone-800 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Walang mahabang registration form o passwords na kakalimutan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Live status tracking sa My Orders (Pickup &amp; Delivery)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Direktang GCash verification kay <strong>{storeSettings.gcashAccountName || 'HUELO PERFUMES OFFICIAL'}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SIGNATURE PERFUME COLLECTION SHOWCASE */}
      <section className="py-20 bg-stone-900 border-b border-stone-800" id="collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block mb-2">
                Curated Olfactory Masterpieces
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-100">
                Signature Fragrance Line
              </h2>
            </div>
            <button
              onClick={handleRegisterWithGmail}
              className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>Mag-register para makita ang kumpletong koleksyon ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseProducts.map((p) => {
              const baseVariant = p.variants[0];
              const displayPrice = baseVariant ? baseVariant.sellingPrice : 280;

              return (
                <div 
                  key={p.id}
                  className="bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-black/60"
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-900">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-[10px] uppercase tracking-wider text-amber-300 px-2.5 py-1 rounded-md font-mono border border-stone-800">
                      {p.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] text-stone-400 font-serif-luxury italic block">
                        {p.brand}
                      </span>
                      <h3 className="text-base font-serif-luxury font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2 mt-1.5">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 block uppercase tracking-wider">Magsisimula sa</span>
                        <span className="text-lg font-mono font-bold text-amber-300">₱{displayPrice.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={handleRegisterWithGmail}
                        className="px-3.5 py-1.5 bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-stone-950 text-xs font-bold rounded-lg transition-colors"
                      >
                        Mag-register
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY REGISTER & EXPERIENCE HUELO */}
      <section className="py-20 bg-stone-950 border-b border-stone-800" id="benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
              Bespoke Craftsmanship
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-100">
              Bakit HUELO PERFUMES?
            </h2>
            <p className="text-stone-400 text-sm">
              Ginawa gamit ang mga pinakamataas na kalidad ng fragrance oils mula sa Grasse, France. Walang shortcuts, walang tinipid na konsentrasyon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif-luxury font-bold text-stone-100">
                30% Extrait de Parfum
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Di hamak na mas matagal kumapit kaysa karaniwang EDP o Cologne. Umaabot sa 12 hanggang 16 na oras ang bango sa damit at balat.
              </p>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif-luxury font-bold text-stone-100">
                Mabilis na Fulfillment
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Standard delivery sa halagang ₱{storeSettings.standardDeliveryFee} lamang. Libreng delivery para sa mga order na aabot sa ₱{storeSettings.freeDeliveryThreshold.toLocaleString()} pataas.
              </p>
            </div>

            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif-luxury font-bold text-stone-100">
                GCash &amp; COD Options
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Madaling magbayad gamit ang GCash kay <strong>{storeSettings.gcashAccountName || 'HUELO PERFUMES OFFICIAL'}</strong> ({storeSettings.gcashNumber}) o kaya Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-b from-stone-900 to-stone-950 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Handa Ka Na Bang Magbango?
          </span>

          <h2 className="text-3xl sm:text-5xl font-serif-luxury font-bold text-stone-100 leading-tight">
            Mag-Register Ngayon Gamit ang Iyong Gmail Account
          </h2>

          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Sumali sa pamilya ng HUELO PERFUMES. Mag-sign up sa loob lamang ng 5 segundo at simulan ang pag-explore sa aming mga de-kalidad na pabango.
          </p>

          <div className="flex items-center justify-center pt-4">
            <button
              onClick={handleRegisterWithGmail}
              disabled={isRegistering}
              className="w-full sm:w-auto px-10 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-6.1z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.5L1.6 15.7C3.5 19.5 7.4 23 12 23z"/>
              </svg>
              <span>{isRegistering ? 'Nagrerehistro...' : 'Mag-register gamit ang Gmail'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer className="bg-stone-950 border-t border-stone-900 py-10 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif-luxury font-bold text-stone-300">HUELO PERFUMES</span>
            <span>·</span>
            <span>Handcrafted Extrait de Parfum Manila</span>
          </div>

          <div>
            <span>GCash: {storeSettings.gcashNumber}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
