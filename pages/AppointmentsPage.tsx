import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import AppointmentCard from '../components/AppointmentCard';
import { getAppointments } from '../services/mockDataService';
import type { Appointment } from '../types';
import Spinner from '../components/ui/Spinner';

interface AppointmentsPageProps {
  startConsultation: (appointment: Appointment) => void;
}

const AppointmentSection: React.FC<{
  title: string;
  appointments: Appointment[];
  onStartConsultation: (appointment: Appointment) => void;
}> = ({ title, appointments, onStartConsultation }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (appointments.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <button
                className="w-full text-left flex justify-between items-center py-3 px-4 bg-gray-100 rounded-t-lg border-b"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-semibold text-gray-700">{title} ({appointments.length})</h2>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="bg-white p-4 rounded-b-lg shadow-sm">
                    {appointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} onStartConsultation={onStartConsultation} />
                    ))}
                </div>
            )}
        </div>
    );
};


const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ startConsultation }) => {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await getAppointments();
            setAllAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    const upcoming = allAppointments
      .filter(a => a.status === 'Upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const past = allAppointments
      .filter(a => a.status === 'Completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    const cancelled = allAppointments
      .filter(a => a.status === 'Cancelled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    return { upcoming, past, cancelled };
  }, [allAppointments]);

  return (
    <PageWrapper title="My Appointments">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div>
          {allAppointments.length > 0 ? (
            <>
                <AppointmentSection title="Upcoming" appointments={sortedAppointments.upcoming} onStartConsultation={startConsultation} />
                <AppointmentSection title="Past" appointments={sortedAppointments.past} onStartConsultation={startConsultation} />
                <AppointmentSection title="Cancelled" appointments={sortedAppointments.cancelled} onStartConsultation={startConsultation} />
            </>
          ) : (
            <p className="text-center text-gray-500 py-10">You have no appointments scheduled.</p>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

export default AppointmentsPage;