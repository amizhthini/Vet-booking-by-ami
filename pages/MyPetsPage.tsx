import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getPets, addPet, updatePet } from '../services/mockDataService';
import type { Pet } from '../types';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import MyPetCard from '../components/MyPetCard';
import EditPetModal from '../components/EditPetModal';

interface MyPetsPageProps {
  navigateTo: (page: Page) => void;
}

const MyPetsPage: React.FC<MyPetsPageProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const [myPets, setMyPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [petToEdit, setPetToEdit] = useState<Pet | null>(null);

    const fetchMyPets = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const allPets = await getPets();
            const userPets = allPets.filter(p => p.ownerId === user.id);
            setMyPets(userPets);
        } catch (error) {
            console.error("Failed to fetch pets", error);
            setToast({ message: 'Failed to load your pets.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyPets();
    }, [fetchMyPets]);
    
    const handleAddPet = () => {
        setPetToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleEditPet = (pet: Pet) => {
        setPetToEdit(pet);
        setIsModalOpen(true);
    };

    const handleSavePet = async (petData: Partial<Omit<Pet, 'id' | 'ownerId' | 'imageUrl'>>, petId?: string) => {
        if (!user) return;
        
        try {
            if (petId) { // Editing existing pet
                await updatePet(petId, petData);
                setToast({ message: 'Pet updated successfully!', type: 'success' });
            } else { // Adding new pet
                const newPetData = {
                    ...petData,
                    name: petData.name || 'Unnamed Pet',
                    breed: petData.breed || 'Unknown',
                    age: petData.age || 0,
                    healthRecord: petData.healthRecord || { vaccinations: [], allergies: [], medications: [] },
                    ownerId: user.id,
                    imageUrl: `https://picsum.photos/seed/${(petData.name || 'pet').toLowerCase()}/200`,
                };
                await addPet(newPetData);
                setToast({ message: 'Pet added successfully!', type: 'success' });
            }
            fetchMyPets(); // Refresh list
        } catch (error) {
            console.error("Failed to save pet:", error);
            setToast({ message: 'Failed to save pet.', type: 'error' });
        }
    };
    
    if (isLoading) {
        return (
            <PageWrapper title="My Pets">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="My Pets">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddPet}>Add New Pet</Button>
            </div>

            {myPets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPets.map(pet => (
                        <MyPetCard key={pet.id} pet={pet} onEdit={handleEditPet} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500">You haven't added any pets yet.</p>
                    <Button className="mt-4" onClick={handleAddPet}>Add Your First Pet</Button>
                </div>
            )}
            
            <EditPetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePet}
                petToEdit={petToEdit}
            />
        </PageWrapper>
    );
};

export default MyPetsPage;
