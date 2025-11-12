import React, { useState, useEffect, useMemo } from 'react';
import { getClinics } from '../services/mockDataService';
import type { Clinic, Vet, Appointment } from '../types';
import { Page } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';

interface ClinicLandingPageProps {
    clinicId: string;
    onExit?: (page?: Page) => void;
}

const ClinicVetCard: React.FC<{ vet: Vet, onBook: (vet: Vet) => void }> = ({ vet, onBook }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
        <img src={vet.imageUrl} alt={vet.name} className="w-full h-48 object-cover"/>
        <div className="p-4">
            <h4 className="text-xl font-bold text-gray-800">{vet.name}</h4>
            <p className="text-teal-600">{vet.specialty}</p>
            <div className="flex items-center mt-2">
                <span className="text-yellow-500">★</span>
                <span className="text-gray-600 text-sm ml-1">{vet.rating} ({vet.reviewCount} reviews)</span>
            </div>
             <Button onClick={() => onBook(vet)} className="w-full mt-4">Book Now</Button>
        </div>
    </div>
);


const ClinicLandingPage: React.FC<ClinicLandingPageProps> = ({ clinicId, onExit }) => {
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [specialtyFilter, setSpecialtyFilter] = useState('All');

    useEffect(() => {
        getClinics().then(clinics => {
            const currentClinic = clinics.find(c => c.id === clinicId);
            setClinic(currentClinic || null);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [clinicId]);

    const handleBookClick = (vet: Vet) => {
        setSelectedVet(vet);
        setIsModalOpen(true);
    };

    const handleBookingCompletion = (result: { success: boolean; data?: Appointment; error?: string }) => {
        if (result.success) {
          setToast({ message: 'Booking successful! Redirecting to your appointments...', type: 'success' });
          setTimeout(() => {
            if (onExit) onExit(Page.Appointments);
          }, 2000);
        } else {
          setToast({ message: result.error || 'An unexpected error occurred.', type: 'error' });
        }
    };
    
    const specialties = useMemo(() => {
        if (!clinic) return [];
        return ['All', ...Array.from(new Set(clinic.vets.map(v => v.specialty)))];
    }, [clinic]);

    const filteredVets = useMemo(() => {
        if (!clinic) return [];
        if (specialtyFilter === 'All') return clinic.vets;
        return clinic.vets.filter(v => v.specialty === specialtyFilter);
    }, [clinic, specialtyFilter]);


    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    if (!clinic) {
        return <div className="flex items-center justify-center h-screen"><p>Clinic not found.</p></div>;
    }

    return (
    <div className="bg-white min-h-screen font-sans relative">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        {onExit && (
            <div className="absolute top-4 left-4 z-50">
                <Button onClick={() => onExit()} variant="secondary">&larr; Back to App</Button>
            </div>
        )}

        {/* Hero Section */}
        <header className="relative h-96">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(https://picsum.photos/seed/clinicbg/1200/400)`}}></div>
            <div className="absolute inset-0 bg-teal-800 bg-opacity-70"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
                <h1 className="text-6xl font-extrabold">{clinic.name}</h1>
                <p className="text-xl mt-4 max-w-2xl">{clinic.address}</p>
            </div>
        </header>

        {/* Team Section */}
        <section id="team" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">Meet Our Team</h2>
                <p className="text-center text-gray-500 mb-8">Dedicated professionals committed to your pet's health.</p>
                
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-2 p-1 bg-gray-200 rounded-full">
                         {specialties.map(spec => (
                            <button 
                                key={spec}
                                onClick={() => setSpecialtyFilter(spec)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${specialtyFilter === spec ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-white'}`}
                            >
                                {spec}
                            </button>
                         ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredVets.map(vet => (
                        <ClinicVetCard key={vet.id} vet={vet} onBook={handleBookClick} />
                    ))}
                </div>
            </div>
        </section>
        
        {/* Services & Contact */}
        <section id="contact" className="py-16">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Comprehensive Wellness Exams</li>
                        <li>Advanced Surgical Suite</li>
                        <li>Emergency & Critical Care</li>
                        <li>In-House Diagnostics & Lab</li>
                        <li>Specialized Cardiology & Oncology</li>
                        <li>Professional Grooming</li>
                    </ul>
                </div>
                <div>
                     <h3 className="text-3xl font-bold text-gray-800 mb-4">Contact & Location</h3>
                     <p className="text-gray-600 mb-2"><strong>Address:</strong> {clinic.address}</p>
                     <p className="text-gray-600 mb-2"><strong>Phone:</strong> (555) 123-4567</p>
                     <p className="text-gray-600"><strong>Hours:</strong> Mon-Fri 8am-6pm, Sat 9am-1pm</p>
                     <div className="mt-4 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Map Placeholder</p>
                    </div>
                </div>
            </div>
        </section>
        
        <footer className="text-center py-6 border-t bg-gray-800 text-white">
            <p>&copy; {new Date().getFullYear()} {clinic.name}. All Rights Reserved.</p>
            <p className="text-sm text-gray-400 mt-1">Powered by <strong>VetSync AI</strong></p>
        </footer>

        <BookingModal
            vet={selectedVet}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onComplete={handleBookingCompletion}
        />
    </div>
    )
}

export default ClinicLandingPage;
