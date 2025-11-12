
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Vet, Appointment, WeeklyAvailability } from '../types';
import { Page } from '../types';
import { getAppointments, updateVet } from '../services/mockDataService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Calendar from '../components/Calendar';
import Spinner from '../components/ui/Spinner';
import WeeklyAvailabilityManager from '../components/WeeklyAvailabilityManager';
import Tabs from '../components/ui/Tabs';
import { useAuth } from '../hooks/useAuth';

interface VetProfilePageProps {
  vet: Vet;
  navigateTo: (page: Page) => void;
}

const VetProfilePage: React.FC<VetProfilePageProps> = ({ vet: initialVet, navigateTo }) => {
    const { user } = useAuth();
    const [vet, setVet] = useState<Vet>(initialVet);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Appointments Calendar');

    useEffect(() => {
        getAppointments().then(data => {
            const vetAppointments = data.filter(a => a.vet.id === vet.id && a.status === 'Upcoming');
            setAppointments(vetAppointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setIsLoading(false);
        });
    }, [vet.id]);

    const handleSaveAvailability = async (newAvailability: WeeklyAvailability) => {
        try {
            const updatedVet = await updateVet(vet.id, { weeklyAvailability: newAvailability });
            setVet(updatedVet);
            // In a real app, show a success toast message
            alert("Schedule updated successfully!");
        } catch (error) {
            console.error("Failed to update schedule:", error);
            // In a real app, show an error toast message
            alert("Failed to update schedule.");
        }
    };

    const handleBackClick = () => {
        if (user?.role === 'Veterinarian' && user.id === vet.id) {
            navigateTo(Page.Dashboard);
        } else {
            navigateTo(Page.VetManagement);
        }
    };
    
    const isOwnProfile = user?.role === 'Veterinarian' && user.id === vet.id;
    const backButtonText = isOwnProfile ? 'Back to Dashboard' : 'Back to Vet Management';

    return (
        <PageWrapper
            title={`Profile: ${vet.name}`}
            onBack={handleBackClick}
            backButtonText={backButtonText}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div className="flex flex-col items-center text-center">
                            <img src={vet.imageUrl} alt={vet.name} className="w-32 h-32 rounded-full object-cover mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">{vet.name}</h2>
                            <p className="text-teal-600">{vet.specialty}</p>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Appointments</h3>
                        {isLoading ? <Spinner /> : (
                            appointments.length > 0 ? (
                                <ul className="space-y-2">
                                    {appointments.slice(0, 5).map(app => (
                                        <li key={app.id} className="text-sm p-2 bg-gray-50 rounded">
                                            <span className="font-semibold">{app.pet.name}</span> - {new Date(app.date).toLocaleString()} at {app.time}
                                        </li>
                                    ))}
                                    {appointments.length > 5 && <li className="text-xs text-center text-gray-500 pt-2">...and {appointments.length-5} more.</li>}
                                </ul>
                            ) : <p className="text-sm text-gray-500">No upcoming appointments.</p>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                     <Tabs
                        tabs={['Appointments Calendar', 'Manage Availability']}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                     />
                     <div className="mt-6">
                        {activeTab === 'Appointments Calendar' && (
                            <Calendar events={vet.schedule} />
                        )}
                        {activeTab === 'Manage Availability' && (
                            <WeeklyAvailabilityManager 
                                initialAvailability={vet.weeklyAvailability}
                                onSave={handleSaveAvailability}
                            />
                        )}
                     </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default VetProfilePage;
