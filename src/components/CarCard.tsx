import { Link } from 'react-router-dom';
import { Car } from '../types';
import { Fuel, Gauge, Calendar, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      <Link to={`/car/${car.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={car.photos[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'}
            alt={`${car.make} ${car.model}`}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              car.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 
              car.status === 'reserved' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {car.status}
            </span>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm">
            <p className="text-indigo-600 font-bold tracking-tight">${car.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
            {car.make} <span className="font-medium">{car.model}</span>
          </h3>
          
          <div className="mt-4 grid grid-cols-2 gap-y-3">
            <div className="flex items-center text-slate-500 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-slate-400" />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center text-slate-500 text-sm">
              <Gauge className="h-4 w-4 mr-2 text-slate-400" />
              <span>{car.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center text-slate-500 text-sm">
              <Fuel className="h-4 w-4 mr-2 text-slate-400" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center text-slate-500 text-sm">
              <Zap className="h-4 w-4 mr-2 text-slate-400" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View Details</button>
            <div className="flex -space-x-2">
              {car.photos.slice(1, 4).map((img, i) => (
                <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
