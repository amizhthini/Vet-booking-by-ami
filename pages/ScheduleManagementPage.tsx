import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Vet, WeeklyAvailability } from '../types';
import { updateVet } from '../services/mockDataService';
import WeeklyAvailabilityManager from '../components/WeeklyAvailabilityManager';
import Tabs from '../components/ui/Tabs';
import Calendar from '../components/Calendar';
import Card from '../components/ui/Card';

interface ScheduleManagementPageProps {
  vet: Vet;
}

const ScheduleManagementPage: React.FC<ScheduleManagementPageProps> = ({ vet: initialVet }) => {
    const [vet, setVet] = useState<Vet>(initialVet);
    const [activeTab, setActiveTab] = useState('Appointments Calendar');

    const handleSaveAvailability = async (newAvailability: WeeklyAvailability) => {
        try {
            const updatedVet = await updateVet(vet.id, { weeklyAvailability: newAvailability });
            setVet(updatedVet);
            // In a real app, you might want to show a success toast message
            alert("Your schedule has been updated successfully!");
        } catch (error) {
            console.error("Failed to update schedule:", error);
            // In a real app, you might want to show an error toast message
            alert("Failed to update schedule. Please try again.");
        }
    };

    return (
        <PageWrapper title="My Schedule">
            <Tabs
                tabs={['Appointments Calendar', 'Manage Availability']}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <div className="mt-6">
                {activeTab === 'Appointments Calendar' && (
                    // FIX: The Card component was used without being imported.
                     <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">My Appointments</h3>
                        <Calendar events={vet.schedule} />
                    </Card>
                )}
                {activeTab === 'Manage Availability' && (
                    <div>
                         <p className="mb-6 text-gray-600">
                            Set your recurring weekly availability here. This schedule will be used to determine your open slots for appointments.
                        </p>
                        <WeeklyAvailabilityManager 
                            initialAvailability={vet.weeklyAvailability}
                            onSave={handleSaveAvailability}
                        />
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default ScheduleManagementPage;
