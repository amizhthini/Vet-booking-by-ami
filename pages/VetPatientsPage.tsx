import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getPetOwners, getPets, getAppointments } from '../services/mockDataService';
import type { Pet, PetOwner, Vet } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface VetPatientsPageProps {
    vet: Vet;
    viewPetProfile: (pet: Pet) => void;
}

const OwnerSection: React.FC<{
    owner: PetOwner;
    pets: Pet[];
    viewPetProfile: (pet: Pet) => void;
}> = ({ owner, pets, viewPetProfile }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Card className="mb-4">
            <button
                className="w-full text-left flex justify-between items-center p-4 -m-6"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-semibold text-gray-700">{owner.name}</h2>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">{pets.length} pet(s)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="mt-4 pt-4 border-t divide-y divide-gray-200">
                    {pets.map(pet => (
                        <div key={pet.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center">
                                <img src={pet.imageUrl} alt={pet.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                <div>
                                    <p className="font-semibold text-gray-800">{pet.name}</p>
                                    <p className="text-sm text-gray-500">{pet.breed}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => viewPetProfile(pet)}>View Profile</Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


const VetPatientsPage: React.FC<VetPatientsPageProps> = ({ vet, viewPetProfile }) => {
    const [owners, setOwners] = useState<PetOwner[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [allAppointments, allOwners, allPets] = await Promise.all([
                    getAppointments(), 
                    getPetOwners(), 
                    getPets()
                ]);

                const vetAppointments = allAppointments.filter(appt => appt.vet.id === vet.id);
                const patientPetIds = new Set(vetAppointments.map(appt => appt.pet.id));
                const vetPatients = allPets.filter(pet => patientPetIds.has(pet.id));
                setPets(vetPatients);

                const patientOwnerIds = new Set(vetPatients.map(pet => pet.ownerId));
                const vetPatientOwners = allOwners.filter(owner => patientOwnerIds.has(owner.id));
                setOwners(vetPatientOwners);

            } catch (error) {
                console.error("Failed to fetch patient records:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [vet.id]);

    const ownersWithPets = useMemo(() => {
        return owners.map(owner => ({
            ...owner,
            pets: pets.filter(pet => pet.ownerId === owner.id),
        })).filter(owner => owner.pets.length > 0);
    }, [owners, pets]);

    if (isLoading) {
        return (
            <PageWrapper title="My Patients">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="My Patients">
             <p className="mb-6 text-gray-600">
                This list includes all pets you have had an appointment with. Click on an owner to see their pets.
            </p>
            {ownersWithPets.length > 0 ? (
                 ownersWithPets.map(owner => (
                    <OwnerSection 
                        key={owner.id} 
                        owner={owner}
                        pets={owner.pets}
                        viewPetProfile={viewPetProfile}
                    />
                ))
            ) : (
                <Card>
                    <p className="text-center text-gray-500 py-10">You do not have any patient records yet.</p>
                </Card>
            )}
        </PageWrapper>
    );
};

export default VetPatientsPage;