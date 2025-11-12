import React, { useState, useEffect } from 'react';
import { getVets } from '../services/mockDataService';
import type { Vet, WeeklyAvailability, Appointment } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';

interface VetLandingPageProps {
    vetId: string;
    onBack?: () => void;
}

const dayOrder: (keyof WeeklyAvailability)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


const VetLandingPage: React.FC<VetLandingPageProps> = ({ vetId, onBack }) => {
    const [vet, setVet] = useState<Vet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        getVets().then(vets => {
            const currentVet = vets.find(v => v.id === vetId);
            setVet(currentVet || null);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [vetId]);

    const handleBookingCompletion = (result: { success: boolean; data?: Appointment; error?: string }) => {
        if (result.success) {
          setToast({ message: 'Booking successful! Check your appointments for details.', type: 'success' });
        } else {
          setToast({ message: result.error || 'An unexpected error occurred.', type: 'error' });
        }
    };

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':');
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    if (!vet) {
        return <div className="flex items-center justify-center h-screen"><p>Veterinarian not found.</p></div>;
    }

    return (
    <div className="bg-gray-50 min-h-screen font-sans relative">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {onBack && (
            <div className="absolute top-4 left-4 z-50">
                <Button onClick={onBack} variant="secondary">&larr; Back to App</Button>
            </div>
        )}
      
      {/* Hero Section */}
      <header className="bg-teal-600 text-white text-center py-20 relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/seed/${vet.id}/1200/400)`}}></div>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10">
            <img src={vet.imageUrl} alt={vet.name} className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
            <h1 className="text-5xl font-bold">{vet.name}</h1>
            <p className="text-xl mt-2">{vet.specialty}</p>
            <Button size="lg" onClick={() => setIsModalOpen(true)} className="mt-8 bg-white text-teal-600 hover:bg-gray-100">Book an Appointment</Button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About & Services Section */}
            <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">About Me</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                    With a deep passion for animal welfare and years of experience in {vet.specialty}, I am dedicated to providing the highest standard of care for your beloved pets. My approach combines compassionate treatment with the latest medical advancements to ensure the best possible outcomes.
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">Services &amp; Pricing</h2>
                <div className="space-y-3">
                    {vet.services && vet.services.length > 0 ? (
                        vet.services.map(service => (
                            <div key={service.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <div>
                                    <p className="font-semibold text-gray-700">{service.name}</p>
                                    <p className="text-sm text-gray-500">{service.type}</p>
                                </div>
                                <p className="font-semibold text-teal-600">${service.basePrice.toFixed(2)}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Services and pricing information coming soon.</p>
                    )}
                </div>
            </div>

            {/* Schedule */}
            <div className="space-y-8">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Weekly Schedule</h3>
                     <div className="space-y-2">
                        {dayOrder.map(day => {
                            const slots = vet.weeklyAvailability?.[day];
                            return (
                                <div key={day} className="flex justify-between text-sm">
                                    <span className="font-semibold text-gray-700">{day}</span>
                                    {slots && slots.length > 0 ? (
                                        <span className="text-gray-600">{formatTime(slots[0].startTime)} - {formatTime(slots[0].endTime)}</span>
                                    ) : (
                                        <span className="text-gray-400">Unavailable</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
      </main>
      
      <footer className="text-center py-6 mt-8 border-t">
        <p className="text-gray-500">Powered by <strong>VetSync AI</strong></p>
      </footer>

      <BookingModal
        vet={vet}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleBookingCompletion}
      />
    </div>
    )
}

export default VetLandingPage;
