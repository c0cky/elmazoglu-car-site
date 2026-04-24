import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car, FuelType, Transmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Fuel, Gauge, Calendar, Zap, 
  MapPin, User, ChevronRight, Repeat, Info, 
  ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CarDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [selectedMyCar, setSelectedMyCar] = useState<string | null>(null);
  const [swapSending, setSwapSending] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const carSnap = await getDoc(doc(db, 'cars', id));
        if (carSnap.exists()) {
          setCar({ id: carSnap.id, ...carSnap.data() } as Car);
        }
        
        if (user) {
          const myCarsQ = query(collection(db, 'cars'), where('ownerUid', '==', user.uid));
          const myCarsSnap = await getDocs(myCarsQ);
          setUserCars(myCarsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  const handleSwapOffer = async () => {
    if (!selectedMyCar || !car || !user) return;
    setSwapSending(true);
    try {
      await addDoc(collection(db, 'swap_offers'), {
        fromCarId: selectedMyCar,
        toCarId: car.id,
        senderUid: user.uid,
        receiverUid: car.ownerUid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSwapSuccess(true);
      setTimeout(() => {
        setShowSwapModal(false);
        setSwapSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSwapSending(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Loading...</div>;
  if (!car) return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Car not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors uppercase text-xs tracking-widest">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[16/10] glass-card shadow-2xl relative"
          >
            <img src={car.photos[activePhoto]} alt="Perspective" className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 pointer-events-none">
              <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest">Selected Perspective</span>
            </div>
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {car.photos.map((photo, i) => (
              <button 
                key={i} 
                onClick={() => setActivePhoto(i)}
                className={`aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all group relative ${
                  activePhoto === i ? 'border-blue-500 scale-[0.98] shadow-lg shadow-blue-500/20' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/10'
                }`}
              >
                <img src={photo} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {activePhoto === i && (
                  <div className="absolute inset-0 bg-blue-500/10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info Area */}
        <div className="flex flex-col">
          <div className="glass-panel p-10 flex-grow relative overflow-hidden">
             {/* Background Accent */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16 rounded-full" />
             
             <div className="flex items-center space-x-2 text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-4">
               <ShieldCheck className="h-4 w-4" />
               <span>Verified Technical Listing</span>
             </div>
             
             <h1 className="text-5xl font-extrabold text-white tracking-tighter uppercase leading-none italic">
               {car.make} <span className="text-blue-400 not-italic">{car.model}</span>
             </h1>
             
             <div className="mt-8 flex items-end justify-between border-b border-white/5 pb-8">
               <div>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valuation Asset</p>
                 <span className="text-4xl font-bold text-white font-mono tracking-tighter">${car.price.toLocaleString()}</span>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status Report</p>
                 <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest block mt-1">Operational Peak</span>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-8">
               {[
                 { icon: Calendar, label: "Cycle", val: car.year },
                 { icon: Gauge, label: "Range", val: `${car.mileage.toLocaleString()} mi` },
                 { icon: Fuel, label: "Pwr", val: car.fuelType },
                 { icon: Zap, label: "Trm", val: car.transmission }
               ].map((spec, i) => (
                 <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center group hover:bg-white/10 transition-colors">
                   <spec.icon className="h-4 w-4 text-blue-400 mr-3" />
                   <div>
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{spec.label}</p>
                     <p className="font-bold text-white text-[11px] mt-0.5 truncate uppercase italic tracking-wider">{spec.val}</p>
                   </div>
                 </div>
               ))}
             </div>

             <div className="mt-10 grid grid-cols-2 gap-4">
               <button 
                 onClick={() => user ? setShowSwapModal(true) : navigate('/dashboard')}
                 className="bg-white text-slate-950 rounded-[1.5rem] p-4 font-bold flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform shadow-2xl active:scale-95 text-[10px] uppercase tracking-widest"
               >
                 <Repeat className="h-4 w-4" />
                 <span>Initiate Swap</span>
               </button>
               <button className="bg-blue-600 text-white rounded-[1.5rem] p-4 font-bold flex items-center justify-center space-x-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95 text-[10px] uppercase tracking-widest">
                 <span>Acquire Unit</span>
                 <ArrowRight className="h-4 w-4" />
               </button>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <section className="glass-panel p-10">
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-6 flex items-center">
              <Info className="h-4 w-4 mr-3 text-blue-400" />
              Technical Dossier
            </h3>
            <p className="text-slate-400 leading-relaxed text-sm font-medium">{car.description}</p>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Exhaust System', detail: 'Active Performance Valves' },
                { label: 'Power Unit', detail: 'Twin-Turbocharged V-Configuration' },
                { label: 'Dynamic Chassis', detail: 'Adaptive Dampening Active' },
                { label: 'Aero Package', detail: 'Front Splitter & Rear Diffuser' }
              ].map((spec, i) => (
                <div key={i} className="flex justify-between border-b border-white/5 py-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{spec.label}</span>
                  <span className="text-xs text-white uppercase font-bold tracking-wider italic">{spec.detail}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-4">
              <User className="h-6 w-6" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Asset Custodian</p>
            <h4 className="text-white font-bold uppercase tracking-tight">Verified Individual</h4>
            <div className="mt-6 w-full space-y-2">
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Report Asset</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Swap Modal */}
      <AnimatePresence>
        {showSwapModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !swapSending && setShowSwapModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border-white/10"
            >
              {!swapSuccess ? (
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white uppercase tracking-tight italic">Initiate <span className="text-blue-400 not-italic">Swap</span></h2>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">Select an active asset from your registry.</p>
                    </div>
                    <button onClick={() => setShowSwapModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {userCars.length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {userCars.map(myCar => (
                        <button 
                          key={myCar.id}
                          onClick={() => setSelectedMyCar(myCar.id)}
                          className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${
                            selectedMyCar === myCar.id ? 'border-blue-600 bg-blue-600/10' : 'border-white/5 hover:border-white/10 bg-white/5'
                          }`}
                        >
                          <img src={myCar.photos[0]} className="w-16 h-12 object-cover rounded-lg" />
                          <div className="ml-4 text-left">
                            <p className="font-bold text-white text-xs uppercase tracking-wider">{myCar.make} {myCar.model}</p>
                            <p className="text-[10px] text-slate-500 font-mono">${myCar.price.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Registry empty. No available units.</p>
                      <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-400 font-bold text-[10px] uppercase tracking-widest hover:text-blue-300">Register Asset</button>
                    </div>
                  )}

                  <button 
                    disabled={!selectedMyCar || swapSending}
                    onClick={handleSwapOffer}
                    className="w-full mt-10 bg-blue-600 text-white rounded-2xl py-4 font-bold disabled:opacity-50 disabled:bg-slate-800 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center shadow-lg shadow-blue-600/30"
                  >
                    {swapSending ? 'Synchronizing Pipeline...' : 'Transmit Request'}
                  </button>
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight italic">Request <span className="text-blue-400 not-italic">Confirmed</span></h2>
                  <p className="text-slate-500 mt-2 text-[10px] uppercase font-bold tracking-widest">Transmission complete. Check your dashboard.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>; }
