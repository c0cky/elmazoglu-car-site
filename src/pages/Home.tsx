import { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car as CarType } from '../types';
import CarCard from '../components/CarCard';
import { Search, ChevronRight, Star, ShieldCheck, Clock, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(
          collection(db, 'cars'),
          where('status', '==', 'available'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarType));
        setFeaturedCars(cars);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background"
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter">
              Drive Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Ambition</span>
            </h1>
            <p className="mt-6 text-xl text-slate-300 leading-relaxed font-medium">
              Discover the finest collection of premium vehicles tailored for the modern enthusiast. Expertly curated, rigorously inspected.
            </p>
            
            <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Seach by make or model..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
                Explore Now
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Verified Listings", desc: "Every vehicle undergoes a 200-point inspection before listing." },
            { icon: Clock, title: "Instant Support", desc: "Our AI-powered customer concierge is available 24/7." },
            { icon: Star, title: "Premium Experience", desc: "Concierge delivery and paperwork handling for all purchases." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900 tracking-tight uppercase">{item.title}</h3>
              <p className="mt-2 text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Cars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Featured Inventory</h2>
            <p className="mt-2 text-slate-500">Hand-picked premium selections of the week.</p>
          </div>
          <Link to="/listings" className="group flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-all px-4 py-2 rounded-xl border border-transparent hover:border-indigo-100 uppercase text-sm tracking-wider">
            View All <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-96 border border-slate-100"></div>
            ))}
          </div>
        ) : featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <Car className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-slate-500 font-medium">No featured cars available right now.</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-tight">
              Ready to Upgrade Your Ride?
            </h2>
            <p className="mt-6 text-lg text-slate-400">
              List your current vehicle for swap or sale and connect with thousands of premium buyers across the country.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40">
                Sell Your Car
              </Link>
              <Link to="/listings" className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
