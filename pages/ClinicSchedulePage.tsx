import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getVets, getAppointments } from '../services/mockDataService';
import type { Vet, Appointment, CalendarEvent } from '../types';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Calendar from '../components/Calendar';

const ClinicSchedulePage: React.FC = () => {
    const [allVets, setAllVets] = useState<Vet[]>([]);
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVetId, setSelectedVetId] = useState<string>('all');
    
    // In a real app, this would come from the logged-in user's context
    const clinicId = 'c1'; 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [vetData, appointmentData] = await Promise.all([
                    getVets(),
                    getAppointments()
                ]);
                setAllVets(vetData);
                setAllAppointments(appointmentData);
            } catch (error) {
                console.error("Failed to fetch schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 sm:mb-0">Full Clinic Calendar</h2>
                    <div>
                        <label htmlFor="vetFilter" className="sr-only">Filter by Veterinarian</label>
                        <select 
                            id="vetFilter"
                            value={selectedVetId}
                            onChange={(e) => setSelectedVetId(e.target.value)}
                            className="block w-full sm:w-64 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        >
                            <option value="all">All Veterinarians</option>
                            {clinicVets.map(vet => (
                                <option key={vet.id} value={vet.id}>{vet.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <Calendar events={calendarEvents} />
            </Card>
        </PageWrapper>
    );
};

export default ClinicSchedulePage;
