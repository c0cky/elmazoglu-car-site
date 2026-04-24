import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car } from '../types';
import CarCard from '../components/CarCard';
import { Filter, X, Search, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Listings() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const [filters, setFilters] = useState({
    make: queryParams.get('q') || '',
    minPrice: '',
    maxPrice: '',
    year: '',
    fuelType: '',
    transmission: ''
  });

  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      try {
        let q = query(collection(db, 'cars'), where('status', '==', 'available'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        let allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
        
        // Client-side filtering for simplicity in this demo (Firebase limited on complex inequality queries)
        const filtered = allCars.filter(car => {
          const matchMake = !filters.make || 
            car.make.toLowerCase().includes(filters.make.toLowerCase()) || 
            car.model.toLowerCase().includes(filters.make.toLowerCase());
          const matchPriceMin = !filters.minPrice || car.price >= Number(filters.minPrice);
          const matchPriceMax = !filters.maxPrice || car.price <= Number(filters.maxPrice);
          const matchFuel = !filters.fuelType || car.fuelType === filters.fuelType;
          const matchTrans = !filters.transmission || car.transmission === filters.transmission;
          const matchYear = !filters.year || car.year === Number(filters.year);
          
          return matchMake && matchPriceMin && matchPriceMax && matchFuel && matchTrans && matchYear;
        });

        setCars(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [filters]);

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic">Market <span className="text-blue-400 not-italic">Cluster</span></h1>
          <p className="text-slate-500 mt-2 uppercase tracking-widest text-[10px] font-bold">Real-time inventory synchronization active</p>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Filter by Make/Model..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold uppercase tracking-wider text-white placeholder:text-slate-600"
              value={filters.make}
              onChange={(e) => setFilters(prev => ({ ...prev, make: e.target.value }))}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
              showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Refine</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full lg:w-72 space-y-8 glass-panel p-8 h-fit sticky top-24"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Technical Params</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-full text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Price Range (USD)</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    />
                    <span className="text-slate-700">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Propulsion Type</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={filters.fuelType}
                    onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    <option value="Petrol">Petrol / ICE</option>
                    <option value="Diesel">Diesel / ICE</option>
                    <option value="Electric">Electric / EV</option>
                    <option value="Hybrid">Hybrid / HEV</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">Transmission</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={filters.transmission}
                    onChange={(e) => setFilters(prev => ({ ...prev, transmission: e.target.value }))}
                  >
                    <option value="">All Systems</option>
                    <option value="Manual">Manual Gearbox</option>
                    <option value="Automatic">Automatic Transmission</option>
                  </select>
                </div>

                <button 
                  onClick={() => setFilters({ make: '', minPrice: '', maxPrice: '', year: '', fuelType: '', transmission: '' })}
                  className="w-full py-3 bg-white/5 text-slate-400 rounded-xl text-[10px] font-bold hover:bg-white/10 hover:text-white transition-all uppercase tracking-[0.2em]"
                >
                  Reset Diagnostics
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Listings Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse glass-card h-96"></div>
              ))}
            </div>
          ) : cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {cars.map(car => (
                <div key={car.id} className="relative group/card">
                  <CarCard car={car} />
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleCompare(car.id); }}
                    className={`absolute bottom-24 right-4 p-2 rounded-xl shadow-2xl shadow-black transition-all z-10 border ${
                      compareList.includes(car.id) 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white/80 opacity-0 group-hover/card:opacity-100'
                    }`}
                    title="Compare Car"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-panel border-dashed border-white/10">
              <Filter className="mx-auto h-12 w-12 text-slate-700" />
              <p className="mt-4 text-slate-500 font-medium text-lg">No assets match your search parameters.</p>
              <button 
                onClick={() => setFilters({ make: '', minPrice: '', maxPrice: '', year: '', fuelType: '', transmission: '' })}
                className="mt-6 text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase text-xs tracking-widest"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-[2rem] shadow-2xl z-50 flex items-center space-x-8 border border-white/10"
          >
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{compareList.length} Selected Units</span>
              <div className="flex space-x-2">
                {compareList.map(id => {
                  const car = cars.find(c => c.id === id);
                  return (
                    <div key={id} className="relative w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-slate-800">
                      <img src={car?.photos[0]} alt="car" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => toggleCompare(id)}
                        className="absolute inset-0 bg-red-600/80 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <button 
              onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
              disabled={compareList.length < 2}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold disabled:bg-slate-800 disabled:text-slate-600 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-blue-600/30"
            >
              Analyze Batch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
