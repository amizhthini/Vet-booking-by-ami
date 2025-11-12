import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments, getPets } from '../services/mockDataService';
import type { Appointment, Vet, Pet } from '../types';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';


interface VetAppointmentsPageProps {
  vet: Vet;
  startConsultation: (appointment: Appointment) => void;
}

const getAppointmentDateTime = (appointment: Appointment): Date => {
    const [time, modifier] = appointment.time.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM' && parseInt(hours, 10) < 12) {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return new Date(`${appointment.date}T${hours.padStart(2, '0')}:${minutes}:00`);
}

const VetAppointmentsPage: React.FC<VetAppointmentsPageProps> = ({ vet, startConsultation }) => {
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [allPets, setAllPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const tabs = ['Upcoming', 'Pending', 'Past', 'Cancelled'];

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const [appointmentData, petData] = await Promise.all([getAppointments(), getPets()]);
            const vetAppointments = appointmentData.filter(a => a.vet.id === vet.id);
            setAllAppointments(vetAppointments);
            setAllPets(petData);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [vet.id]);

    const handleCreateComplete = (result: { success: boolean; data?: Appointment; error?: string }) => {
        if (result.success && result.data) {
            setToast({ message: 'Appointment created successfully!', type: 'success' });
            fetchAppointments(); // Re-fetch all appointments
        } else {
            setToast({ message: result.error || 'Failed to create appointment.', type: 'error' });
        }
    };

    const sortedAppointments = useMemo(() => {
    const upcoming = allAppointments
        .filter(a => a.status === 'Upcoming')
        .sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());
        
    const pending = allAppointments
        .filter(a => a.status === 'Pending')
        .sort((a, b) => getAppointmentDateTime(a).getTime() - getAppointmentDateTime(b).getTime());

    const past = allAppointments
        .filter(a => a.status === 'Completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    const cancelled = allAppointments
        .filter(a => a.status === 'Cancelled')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    return { upcoming, pending, past, cancelled };
    }, [allAppointments]);
    
    const appointmentsForTab = {
    'Upcoming': sortedAppointments.upcoming,
    'Pending': sortedAppointments.pending,
    'Past': sortedAppointments.past,
    'Cancelled': sortedAppointments.cancelled,
    };

    const renderAppointments = () => {
        const appointments = appointmentsForTab[activeTab as keyof typeof appointmentsForTab];
        if (appointments.length === 0) {
            return (
                <Card>
                    <p className="text-center text-gray-500 py-10">You have no {activeTab.toLowerCase()} appointments.</p>
                </Card>
            )
        }
        return (
            <div className="space-y-4">
                {appointments.map(appointment => (
                    <AppointmentCard 
                        key={appointment.id} 
                        appointment={appointment} 
                        onStartConsultation={startConsultation}
                    />
                ))}
            </div>
        )
    }

    return (
        <PageWrapper title="My Appointments">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-between items-center mb-4">
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <Button onClick={() => setIsCreateModalOpen(true)}>Create New Appointment</Button>
            </div>
            <div className="mt-6">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
                </div>
            ) : (
                renderAppointments()
            )}
            </div>
            <BookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onComplete={handleCreateComplete}
                mode="create"
                allPets={allPets}
                loggedInVet={vet}
            />
        </PageWrapper>
    );
};

export default VetAppointmentsPage;