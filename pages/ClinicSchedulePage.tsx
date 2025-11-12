import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getVets, getAppointments, getPets } from '../services/mockDataService';
import type { Vet, Appointment, CalendarEvent, Pet } from '../types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Calendar from '../components/Calendar';
import Button from '../components/ui/Button';
import BookingModal from '../components/BookingModal';
import Toast from '../components/ui/Toast';


const ClinicSchedulePage: React.FC = () => {
    const [allVets, setAllVets] = useState<Vet[]>([]);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [allPets, setAllPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVetId, setSelectedVetId] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    
    // In a real app, this would come from the logged-in user's context
    const clinicId = 'c1'; 

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [vetData, appointmentData, petData] = await Promise.all([
                getVets(),
                getAppointments(),
                getPets()
            ]);
            setAllVets(vetData);
            setAllAppointments(appointmentData);
            setAllPets(petData);
        } catch (error) {
            console.error("Failed to fetch schedule data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

     const handleCreateComplete = (result: { success: boolean; data?: Appointment; error?: string }) => {
        if (result.success && result.data) {
            setToast({ message: 'Appointment created successfully!', type: 'success' });
            fetchData(); // Re-fetch all data
        } else {
            setToast({ message: result.error || 'Failed to create appointment.', type: 'error' });
        }
    };

    const clinicVets = useMemo(() => {
        return allVets.filter(vet => vet.clinicId === clinicId);
    }, [allVets, clinicId]);

    const calendarEvents = useMemo((): CalendarEvent[] => {
        if (isLoading) return [];

        const vetsToProcess = selectedVetId === 'all' 
            ? clinicVets 
            : clinicVets.filter(v => v.id === selectedVetId);

        if (!vetsToProcess) return [];
        
        const events: CalendarEvent[] = [];

        vetsToProcess.forEach(vet => {
            // Add blocked time from vet's schedule
            if (vet.schedule) {
                vet.schedule.forEach(event => {
                    events.push({
                        ...event,
                        title: selectedVetId === 'all' ? `${event.title} (${vet.name.split(' ').pop()})` : event.title,
                    });
                });
            }

            // Add appointments
            allAppointments
                .filter(appt => appt.vet.id === vet.id)
                .forEach(appt => {
                    events.push({
                        id: appt.id,
                        date: appt.date,
                        title: selectedVetId === 'all' 
                            ? `${appt.time} ${appt.pet.name} (${appt.vet.name.split(' ').pop()})`
                            : `${appt.time} ${appt.pet.name}`,
                        type: 'appointment',
                    });
                });
        });

        return events;
    }, [isLoading, selectedVetId, clinicVets, allAppointments]);

    if (isLoading) {
        return (
            <PageWrapper title="Clinic Schedule">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="Clinic Schedule">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4">
                    <div className="mb-4 sm:mb-0">
                        <h2 className="text-xl font-semibold text-gray-700">Full Clinic Calendar</h2>
                        <p className="text-sm text-gray-500">View all appointments or filter by veterinarian.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <select 
                            id="vetFilter"
                            value={selectedVetId}
                            onChange={(e) => setSelectedVetId(e.target.value)}
                            className="block w-full sm:w-56 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        >
                            <option value="all">All Veterinarians</option>
                            {clinicVets.map(vet => (
                                <option key={vet.id} value={vet.id}>{vet.name}</option>
                            ))}
                        </select>
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create Appointment</Button>
                    </div>
                </div>
                 <Calendar events={calendarEvents} />
            </Card>
            <BookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onComplete={handleCreateComplete}
                mode="create"
                allPets={allPets}
                allVets={allVets}
            />
        </PageWrapper>
    );
};

export default ClinicSchedulePage;