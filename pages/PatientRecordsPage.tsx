import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getPetOwners, getPets } from '../services/mockDataService';
import type { Pet, PetOwner } from '../types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface PatientRecordsPageProps {
    viewPetProfile: (pet: Pet) => void;
}

const OwnerSection: React.FC<{
    owner: PetOwner;
    pets: Pet[];
    viewPetProfile: (pet: Pet) => void;
}> = ({ owner, pets, viewPetProfile }) => {
    const [isOpen, setIsOpen] = useState(false);

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
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="mt-4 pt-4 border-t">
                    {pets.map(pet => (
                        <div key={pet.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
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


const PatientRecordsPage: React.FC<PatientRecordsPageProps> = ({ viewPetProfile }) => {
    const [owners, setOwners] = useState<PetOwner[]>([]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // For a real clinic admin, you would filter by clinicId
                const [ownerData, petData] = await Promise.all([getPetOwners(), getPets()]);
                setOwners(ownerData);
                setPets(petData);
            } catch (error) {
                console.error("Failed to fetch patient records:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const ownersWithPets = useMemo(() => {
        return owners.map(owner => ({
            ...owner,
            pets: pets.filter(pet => pet.ownerId === owner.id),
        }));
    }, [owners, pets]);

    if (isLoading) {
        return (
            <PageWrapper title="Patient Records">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="Patient Records">
            {ownersWithPets.map(owner => (
                <OwnerSection 
                    key={owner.id} 
                    owner={owner}
                    pets={owner.pets}
                    viewPetProfile={viewPetProfile}
                />
            ))}
        </PageWrapper>
    );
};

export default PatientRecordsPage;