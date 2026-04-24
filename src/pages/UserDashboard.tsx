import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Car, SwapOffer } from '../types';
import { Plus, Trash2, Repeat, Package, LayoutDashboard, CloudUpload, Check, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'listings' | 'offers'>('listings');
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    make: '', model: '', year: new Date().getFullYear(),
    price: 0, mileage: 0, fuelType: 'Petrol',
    transmission: 'Manual', description: '', features: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const q = query(collection(db, 'cars'), where('ownerUid', '==', user.uid));
        const carsSnap = await getDocs(q);
        setMyCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Car)));

        const offersQ = query(collection(db, 'swap_offers'), where('receiverUid', '==', user.uid));
        const offersSnap = await getDocs(offersQ);
        const offers = await Promise.all(offersSnap.docs.map(async d => {
          const data = d.data();
          const fromCar = await getDoc(doc(db, 'cars', data.fromCarId));
          const toCar = await getDoc(doc(db, 'cars', data.toCarId));
          return { 
            id: d.id, 
            ...data, 
            fromCar: fromCar.data(), 
            toCar: toCar.data() 
          };
        }));
        setReceivedOffers(offers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || files.length === 0) return;
    setUploading(true);

    try {
      const photoUrls = await Promise.all(files.map(async file => {
        const fileRef = ref(storage, `cars/${user.uid}/${Date.now()}_${file.name}`);
        const result = await uploadBytes(fileRef, file);
        return getDownloadURL(result.ref);
      }));

      const newCar: any = {
        ...formData,
        price: Number(formData.price),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        features: formData.features.split(',').map(f => f.trim()),
        photos: photoUrls,
        ownerUid: user.uid,
        status: 'available',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'cars'), newCar);
      setMyCars(prev => [{ id: docRef.id, ...newCar, createdAt: new Date().toISOString() }, ...prev]);
      setShowAddModal(false);
      setFormData({
        make: '', model: '', year: new Date().getFullYear(),
        price: 0, mileage: 0, fuelType: 'Petrol',
        transmission: 'Manual', description: '', features: ''
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleOfferResponse = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'swap_offers', offerId), { status });
      setReceivedOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCar = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'cars', id));
      setMyCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-24 text-center">Please sign in to access your dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center space-x-6">
          <div className="h-20 w-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative group">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic">Control <span className="text-blue-400 not-italic">Center</span></h1>
            <div className="mt-1 flex items-center space-x-3 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
               <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">{profile?.role} Status</span>
               <span className="text-slate-400">{user.email}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="uppercase tracking-widest text-[10px]">Add Managed Asset</span>
        </button>
      </div>

      <div className="flex space-x-8 border-b border-white/5 mb-10">
        {[
          { id: 'listings', label: 'Unit Registry', icon: Package },
          { id: 'offers', label: 'Swap Pipelines', icon: Repeat }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 py-4 border-b-2 transition-all font-bold uppercase tracking-widest text-[10px] ${
              activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'listings' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCars.map(car => (
              <div key={car.id} className="relative group">
                <div className="glass-card flex flex-col h-full hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={car.photos[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                         car.status === 'available' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-900 border border-white/10 text-slate-400'
                       }`}>{car.status}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-white uppercase italic tracking-tight">{car.make} <span className="text-blue-400 not-italic">{car.model}</span></h3>
                    <div className="mt-4 flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <p className="text-white font-mono font-bold text-sm tracking-tighter">${car.price.toLocaleString()}</p>
                      <button onClick={() => deleteCar(car.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {myCars.length === 0 && !loading && (
              <div className="col-span-full py-24 text-center glass-panel border-dashed border-white/10">
                <Package className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No assets registered in current session.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {receivedOffers.map(offer => (
              <div key={offer.id} className="glass-panel p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-500/30 transition-all border-white/5">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <div className="h-24 w-32 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <img src={offer.fromCar?.photos[0]} className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/30">
                      <Repeat className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] italic">Incoming Proposal</p>
                    <h4 className="font-bold text-white uppercase italic tracking-tight">
                      {offer.fromCar?.make} <span className="not-italic text-blue-400">{offer.fromCar?.model}</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">In exchange for your {offer.toCar?.make} {offer.toCar?.model}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {offer.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleOfferResponse(offer.id, 'accepted')}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 active:scale-95"
                      >
                        <Check className="h-4 w-4" /> <span>Accept</span>
                      </button>
                      <button 
                        onClick={() => handleOfferResponse(offer.id, 'rejected')}
                        className="bg-white/5 border border-white/10 text-red-400 px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 hover:bg-red-500/10 transition-all active:scale-95"
                      >
                        <X className="h-4 w-4" /> <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border ${
                      offer.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      Proposal {offer.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {receivedOffers.length === 0 && !loading && (
              <div className="py-24 text-center glass-panel border-dashed border-white/10">
                <Repeat className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Zero active signals in swap pipeline.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !uploading && setShowAddModal(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-panel w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden my-auto border-white/10"
            >
              <form onSubmit={handleAddCar} className="p-8 md:p-12 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-extrabold text-white tracking-tighter uppercase italic">Inject <span className="text-blue-400 not-italic">Asset</span></h2>
                  <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                    <X className="h-6 w-6 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Configuration Make</label>
                    <input required className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs text-white" type="text" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} placeholder="e.g. Porsche" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Technical Model</label>
                    <input required className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs text-white" type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} placeholder="e.g. 911 GT3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Production Cycle</label>
                    <input required className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs text-white" type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Asset Valuation ($)</label>
                    <input required className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs text-white" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Visual Documentation (MAX 4)</label>
                  <div className="grid grid-cols-4 gap-4">
                    {files.map((file, i) => (
                      <div key={i} className="aspect-square bg-slate-950 rounded-xl overflow-hidden relative border border-white/10 group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {files.length < 4 && (
                      <label className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all text-slate-600 hover:text-blue-400">
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Capture</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files || [])].slice(0, 4))} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Operational Dossier</label>
                  <textarea rows={4} className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-white placeholder:text-slate-700" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Input engineering details and current status..." />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading || files.length === 0}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2rem] text-[10px] shadow-xl shadow-blue-600/30 disabled:opacity-50 disabled:bg-slate-800 disabled:shadow-none hover:bg-blue-500 transition-all active:scale-95"
                >
                  {uploading ? 'Analyzing Metadata...' : 'Transmit Registry Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
