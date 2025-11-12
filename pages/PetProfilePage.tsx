import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Pet, Appointment, PetOwner, Attachment } from '../types';
import { Page } from '../types';
import { getAppointments, getPetOwners, updateAppointment } from '../services/mockDataService';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import AppointmentCard from '../components/AppointmentCard';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import AddAppointmentDetailsModal from '../components/AddAppointmentDetailsModal';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';

interface PetProfilePageProps {
  pet: Pet;
  navigateTo: (page: Page) => void;
}

const HealthRecordItem: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
        <h4 className="font-semibold text-gray-600 text-sm uppercase tracking-wider">{title}</h4>
        {items.length > 0 ? (
             <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        ) : (
            <p className="text-gray-500 mt-1">None listed.</p>
        )}
    </div>
);


const PetProfilePage: React.FC<PetProfilePageProps> = ({ pet, navigateTo }) => {
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [owner, setOwner] = useState<PetOwner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [appointmentToReschedule, setAppointmentToReschedule] = useState<Appointment | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [appointmentsData, ownersData] = await Promise.all([
                    getAppointments(),
                    getPetOwners()
                ]);
                setAllAppointments(appointmentsData);
                setOwner(ownersData.find(o => o.id === pet.ownerId) || null);
            } catch (error) {
                console.error("Failed to load pet profile data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [pet.id, pet.ownerId]);

    const petAppointments = useMemo(() => {
        return allAppointments
            .filter(a => a.pet.id === pet.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allAppointments, pet.id]);

    const handleBackClick = () => {
        if (user?.role === 'Veterinarian') {
            navigateTo(Page.Patients);
        } else {
            navigateTo(Page.PatientRecords);
        }
    };

    const handleOpenDetailsModal = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailsModalOpen(true);
    };

    const handleSaveDetails = async (appointmentId: string, data: { userNotes?: string; attachments?: Attachment[] }) => {
        try {
            const updatedAppt = await updateAppointment(appointmentId, data);
            setAllAppointments(prev => prev.map(a => a.id === appointmentId ? updatedAppt : a));
        } catch (error) {
            console.error("Failed to save details:", error);
            setToast({ message: 'Failed to save details.', type: 'error' });
        }
    };

    const handleOpenRescheduleModal = (appointment: Appointment) => {
        setAppointmentToReschedule(appointment);
        setIsRescheduleModalOpen(true);
    };
    
    const handleRescheduleComplete = (result: { success: boolean; data?: Appointment; error?: string }) => {
        if (result.success && result.data) {
            setAllAppointments(prev => prev.map(a => a.id === result.data!.id ? result.data! : a));
            setToast({ message: 'Appointment rescheduled successfully!', type: 'success' });
        } else {
            setToast({ message: result.error || 'Failed to reschedule.', type: 'error' });
        }
        setAppointmentToReschedule(null);
    };

    const handleCancelAppointment = async (appointment: Appointment) => {
        if (window.confirm(`Are you sure you want to cancel this appointment? This action cannot be undone.`)) {
            try {
                const updatedAppt = await updateAppointment(appointment.id, { status: 'Cancelled' });
                setAllAppointments(prev => prev.map(a => a.id === appointment.id ? updatedAppt : a));
                setToast({ message: 'Appointment cancelled successfully.', type: 'success' });
            } catch (error) {
                console.error("Failed to cancel appointment:", error);
                setToast({ message: 'Failed to cancel appointment.', type: 'error' });
            }
        }
    };

    if (isLoading) {
        return (
            <PageWrapper title={`Loading Profile for ${pet.name}...`}>
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title={`Patient Profile: ${pet.name}`}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
             <div className="mb-4">
                <Button variant="ghost" onClick={handleBackClick}>
                    &larr; Back to Patient List
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div className="flex flex-col items-center text-center">
                            <img src={pet.imageUrl} alt={pet.name} className="w-32 h-32 rounded-full object-cover mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">{pet.name}</h2>
                            <p className="text-gray-600">{pet.breed}</p>
                            <p className="text-sm text-gray-500 mt-1">{pet.age} years old</p>
                            {owner && <p className="text-sm text-gray-500">Owner: {owner.name}</p>}
                        </div>
                    </Card>
                     <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Health Record</h3>
                        <div className="space-y-4">
                            <HealthRecordItem title="Vaccinations" items={pet.healthRecord.vaccinations} />
                            <HealthRecordItem title="Allergies" items={pet.healthRecord.allergies} />
                            <HealthRecordItem title="Current Medications" items={pet.healthRecord.medications} />
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Appointment History</h2>
                    {petAppointments.length > 0 ? (
                        <div className="space-y-4">
                           {petAppointments.map(appt => (
                                <AppointmentCard 
                                    key={appt.id} 
                                    appointment={appt} 
                                    onStartConsultation={() => {}} 
                                    onAddDetails={user?.role === 'Pet Parent' ? handleOpenDetailsModal : () => {}}
                                    onReschedule={user?.role === 'Pet Parent' ? handleOpenRescheduleModal : undefined}
                                    onCancel={user?.role === 'Pet Parent' ? handleCancelAppointment : () => {}}
                                />
                           ))}
                        </div>
                    ): (
                        <Card>
                            <p className="text-center text-gray-500 py-10">No appointment history found for {pet.name}.</p>
                        </Card>
                    )}
                </div>
            </div>
            {user?.role === 'Pet Parent' && (
                <>
                    <AddAppointmentDetailsModal 
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        appointment={selectedAppointment}
                        onSave={handleSaveDetails}
                    />
                    <BookingModal 
                        isOpen={isRescheduleModalOpen}
                        onClose={() => setIsRescheduleModalOpen(false)}
                        vet={appointmentToReschedule?.vet || null}
                        appointmentToReschedule={appointmentToReschedule}
                        onComplete={handleRescheduleComplete}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default PetProfilePage;