import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Package, TrendingUp, Search, MoreVertical, 
  Trash2, ExternalLink, BarChart3, Clock, ArrowUpRight, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [stats, setStats] = useState({ totalValue: 0, activeCount: 0, soldCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const q = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const allCars = snap.docs.map(d => ({ id: d.id, ...d.data() } as Car));
        setCars(allCars);

        const active = allCars.filter(c => c.status === 'available');
        const sold = allCars.filter(c => c.status === 'sold');
        const value = active.reduce((sum, c) => sum + (c.price || 0), 0);
        
        setStats({ totalValue: value, activeCount: active.length, soldCount: sold.length });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const updateCarStatus = async (id: string, status: Car['status']) => {
    try {
      await updateDoc(doc(db, 'cars', id), { status });
      setCars(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCar = async (id: string) => {
    if (!window.confirm('IRREVERSIBLE: Delete this vehicle from cluster?')) return;
    try {
      await deleteDoc(doc(db, 'cars', id));
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const seedTestData = async () => {
    if (!user) return;
    setLoading(true);
    const testCars = [
      {
        make: 'Porsche', model: '911 Carrera', year: 2023, price: 125000,
        mileage: 1200, fuelType: 'Petrol', transmission: 'Automatic',
        photos: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70'],
        ownerUid: user.uid, status: 'available', features: ['PDK', 'Sport Exhaust', 'BOSE Audio'],
        description: 'Pristine condition, single owner, rarely driven GT Silver Metallic Carrera.',
        createdAt: new Date().toISOString()
      },
      {
        make: 'Tesla', model: 'Model S Plaid', year: 2024, price: 89000,
        mileage: 500, fuelType: 'Electric', transmission: 'Automatic',
        photos: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89'],
        ownerUid: user.uid, status: 'available', features: ['Full Self-Driving', 'Carbon Fiber Decor', '21" Arachnid Wheels'],
        description: 'The fastest accelerating production car. Stunning Midnight Cherry Red.',
        createdAt: new Date().toISOString()
      },
      {
        make: 'BMW', model: 'M4 Competition', year: 2022, price: 78000,
        mileage: 12000, fuelType: 'Petrol', transmission: 'Automatic',
        photos: ['https://images.unsplash.com/photo-1555215695-3004980ad54e'],
        ownerUid: user.uid, status: 'available', features: ['M Carbon Bucket Seats', 'Harmon Kardon', 'Laser Lights'],
        description: 'Immaculate M4 with full service history and carbon exterior package.',
        createdAt: new Date().toISOString()
      }
    ];

    try {
      for (const car of testCars) {
        await addDoc(collection(db, 'cars'), {
          ...car,
          createdAt: serverTimestamp()
        });
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-24 text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 uppercase">Access Restricted</h2>
        <p className="text-slate-500">Security protocol: Admin credentials required for this endpoint.</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Active', value: stats.activeCount, color: '#4f46e5' },
    { name: 'Sold', value: stats.soldCount, color: '#10b981' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase italic mb-2">Automotive <span className="text-blue-400 not-italic">Ops Center</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Enterprise Inventory Management & Cluster Diagnostics.</p>
        </div>
        <button 
          onClick={seedTestData}
          className="bg-white/5 text-blue-400 border border-blue-500/20 px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600/10 transition-all active:scale-95 shadow-lg shadow-blue-500/5"
        >
          Seed Archive Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          { label: 'Active Pipeline Valuation', value: `$${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
          { label: 'In-Cluster Units', value: stats.activeCount, icon: Package, color: 'text-blue-400', bg: 'bg-blue-600/10' },
          { label: 'Completed Transactions', value: stats.soldCount, icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-600/10' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 flex items-center justify-between group overflow-hidden relative border-white/5"
          >
            <div className="relative z-10">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 font-mono">{stat.label}</p>
              <h3 className="text-4xl font-black text-white tracking-tighter italic">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl relative z-10 transition-transform group-hover:scale-110 shadow-lg`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel overflow-hidden border-white/5">
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
              <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center">
                <Clock className="h-4 w-4 mr-3 text-blue-400" />
                Real-Time Arrival Feed
              </h3>
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="Filter Node IDs..." 
                  className="bg-slate-900 border border-white/10 text-[9px] uppercase font-bold py-3 pl-12 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-white" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="p-6 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest">Asset designation</th>
                    <th className="p-6 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest">Operational Status</th>
                    <th className="p-6 text-left text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pricing Matrix</th>
                    <th className="p-6 text-right text-[9px] font-bold text-slate-500 uppercase tracking-widest">Commands</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cars.map(car => (
                    <tr key={car.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-16 rounded-lg overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-colors">
                            <img src={car.photos[0]} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase italic leading-none truncate max-w-[150px]">{car.make} {car.model}</p>
                            <p className="text-[8px] text-slate-600 mt-2 font-mono uppercase">Node_ID: {car.id.slice(0, 12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <select 
                          value={car.status} 
                          onChange={(e) => updateCarStatus(car.id, e.target.value as any)}
                          className={`text-[9px] font-bold uppercase py-1.5 px-3 rounded-lg border border-white/10 focus:ring-1 focus:ring-blue-500 bg-slate-900 cursor-pointer ${
                            car.status === 'available' ? 'text-emerald-400 border-emerald-500/20' : 'text-slate-500 border-white/5'
                          }`}
                        >
                          <option value="available">Available</option>
                          <option value="sold">Terminated</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-blue-400 font-mono tracking-tighter italic">${car.price.toLocaleString()}</span>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => deleteCar(car.id)} className="p-2 text-slate-700 hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-transparent hover:border-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel p-10 border-white/5">
            <h3 className="font-bold uppercase tracking-[0.2em] text-[9px] mb-10 text-slate-500 flex items-center">
              <BarChart3 className="h-4 w-4 mr-3 text-blue-400" /> 
              Inventory Distribution Matrix
            </h3>
            <div className="h-64 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#334155" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(10px)', padding: '1rem', fontSize: '9px', textTransform: 'uppercase' }}
                    itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-10 shadow-2xl text-white group overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/20 rounded-full blur-3xl opacity-50" />
            <ArrowUpRight className="absolute top-6 right-6 h-12 w-12 text-white/20 group-hover:rotate-45 transition-transform duration-500" />
            <h3 className="font-bold uppercase tracking-widest text-[9px] text-blue-100 mb-2">Network Diagnostics</h3>
            <p className="text-3xl font-black tracking-tighter italic uppercase">Cluster Locked</p>
            <p className="mt-6 text-[10px] text-blue-100 leading-relaxed font-bold uppercase tracking-wider opacity-90">
              Encrypted transmission active. Edge synchronization verified across all 12 global availability zones.
            </p>
            <div className="mt-10 pt-8 border-t border-white/10">
               <button className="flex items-center text-[10px] font-black uppercase tracking-[0.25em] hover:text-white transition-all space-x-2">
                <span>Export System Logs</span> 
                <ExternalLink className="h-3 w-3" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
