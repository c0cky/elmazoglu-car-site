import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car } from '../types';
import { ChevronLeft, Check, X, Scale } from 'lucide-react';
import { motion } from 'motion/react';

export default function Compare() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const ids = queryParams.get('ids')?.split(',') || [];
  
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const carPromises = ids.map(id => getDoc(doc(db, 'cars', id)));
        const snapshots = await Promise.all(carPromises);
        setCars(snapshots.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() } as Car)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, [location.search]);

  if (loading) return <div className="p-24 text-center">Comparing...</div>;
  if (cars.length < 2) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
      <Scale className="h-16 w-16 text-slate-200 mx-auto" />
      <h2 className="text-2xl font-bold text-slate-900 uppercase">Not enough data</h2>
      <p className="text-slate-500">Select at least 2 cars from the listings to compare.</p>
      <button onClick={() => navigate('/listings')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Browse Cars</button>
    </div>
  );

  const features = Array.from(new Set(cars.flatMap(c => c.features)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-400 font-bold mb-8 transition-all uppercase text-[10px] tracking-widest group">
        <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Base
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic">Comparison <span className="text-blue-400 not-italic">Matrix</span></h1>
        <p className="text-slate-500 mt-2 text-[10px] uppercase font-bold tracking-widest">Side-by-side technical specification analysis of selected units.</p>
      </div>

      <div className="overflow-x-auto glass-panel border-white/5 shadow-2xl rounded-[2.5rem]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-10 text-left border-b border-white/5 w-64 bg-white/5 backdrop-blur-xl sticky left-0 z-10">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.3em] font-mono">Telemetry Data</span>
              </th>
              {cars.map(car => (
                <th key={car.id} className="p-10 border-b border-white/5 min-w-[320px]">
                  <div className="space-y-6">
                    <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 relative group">
                      <img src={car.photos[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-extrabold text-white uppercase tracking-tight italic">{car.make} <span className="text-blue-400 not-italic">{car.model}</span></h3>
                      <p className="text-xl font-bold text-white font-mono mt-2 tracking-tighter italic">${car.price.toLocaleString()}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { label: 'Production Cycle', key: 'year' },
              { label: 'Operational Range', key: 'mileage', format: (v: number) => `${v.toLocaleString()} MI` },
              { label: 'Power Blueprint', key: 'fuelType' },
              { label: 'Drive Topology', key: 'transmission' },
              { label: 'Market Valuation', key: 'price', format: (v: number) => `$${v.toLocaleString()}` }
            ].map(row => (
              <tr key={row.label} className="group hover:bg-white/5 transition-colors">
                <td className="p-8 font-bold text-white text-[10px] uppercase tracking-widest border-r border-white/5 bg-slate-950/80 backdrop-blur-md sticky left-0 z-10 italic">
                  {row.label}
                </td>
                {cars.map(car => (
                  <td key={car.id} className="p-8 text-slate-400 font-bold text-[11px] text-center uppercase tracking-wider font-mono">
                    {row.format ? row.format((car as any)[row.key]) : (car as any)[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Features Comparison */}
            <tr>
              <td colSpan={cars.length + 1} className="p-6 bg-white/5 border-y border-white/5 text-center">
                <span className="text-[9px] uppercase font-bold text-slate-600 tracking-[0.5em] font-mono">Technical Equipment Specification</span>
              </td>
            </tr>
            {features.map(feature => (
              <tr key={feature} className="group hover:bg-white/5 transition-colors">
                <td className="p-8 font-bold text-slate-400 text-[9px] uppercase tracking-widest border-r border-white/5 bg-slate-950/80 backdrop-blur-md sticky left-0 z-10 truncate max-w-[200px] group-hover:text-white transition-colors">
                  {feature}
                </td>
                {cars.map(car => (
                  <td key={car.id} className="p-8 text-center">
                    {car.features.includes(feature) ? (
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-600/10 scale-110">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-slate-800 border border-white/5">
                        <X className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex justify-center">
         <button onClick={() => navigate('/listings')} className="text-slate-600 hover:text-blue-400 transition-all font-bold uppercase text-[10px] tracking-[0.3em] flex items-center group">
           <Scale className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform shadow-blue-600/20" /> Inject Additional Units
         </button>
      </div>
    </div>
  );
}
