export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'manicura' | 'pedicura' | 'nail-art' | 'esculturales' | 'tratamientos';
  imageUrl: string;
  isCustomizable?: boolean;
  customizationPrompt?: string;
  pricePerUnit?: number;
  durationPerUnit?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  imageUrl: string;
  unavailableDays: number[]; // 0 = Sunday, 6 = Saturday
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface PortfolioImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export interface BookingHistoryItem {
  id: string;
  date: string;
  services: Service[];
  professionalName: string;
  totalPrice: number;
  totalDuration: number;
}

export interface BeforeAfterImage {
  id: string;
  title: string;
  description: string;
  beforeSrc: string;
  afterSrc: string;
}

export interface BookingState {
  selectedServices: Service[];
  customizations: Record<string, { quantity: number; notes: string; images: string[] }>;
  selectedProfessional: TeamMember | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  clientData: {
    name: string;
    email: string;
    phone: string;
    emailReminder?: boolean;
    smsReminder?: boolean;
  };
  currentStep: number;
}
