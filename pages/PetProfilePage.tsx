import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import type { Pet, Appointment, PetOwner } from '../types';
import { Page } from '../types';
import { getAppointments, getPetOwners } from '../services/mockDataService';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import AppointmentCard from '../components/AppointmentCard';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

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

    if (isLoading) {
        return (
            <PageWrapper title={`Loading Profile for ${pet.name}...`}>
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title={`Patient Profile: ${pet.name}`}>
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
                                <AppointmentCard key={appt.id} appointment={appt} onStartConsultation={() => {}} onAddDetails={() => {}} />
                           ))}
                        </div>
                    ): (
                        <Card>
                            <p className="text-center text-gray-500 py-10">No appointment history found for {pet.name}.</p>
                        </Card>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default PetProfilePage;