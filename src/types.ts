export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export type CarStatus = 'available' | 'sold' | 'reserved';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  photos: string[];
  ownerUid: string;
  description: string;
  features: string[];
  status: CarStatus;
  createdAt: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface SwapOffer {
  id: string;
  fromCarId: string;
  toCarId: string;
  senderUid: string;
  receiverUid: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderUid: string;
  text: string;
  createdAt: any;
}
