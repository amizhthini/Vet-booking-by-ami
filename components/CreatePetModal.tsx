import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Tabs from './ui/Tabs';
import type { Pet, PetOwner } from '../types';
import { addPet, addPetOwner } from '../services/mockDataService';

interface CreatePetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (result: { success: boolean, data?: Pet, error?: string }) => void;
    existingOwners: PetOwner[];
}

const CreatePetModal: React.FC<CreatePetModalProps> = ({ isOpen, onClose, onComplete, existingOwners }) => {
    const [petName, setPetName] = useState('');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [ownerMode, setOwnerMode] = useState<'existing' | 'new'>('existing');
    const [selectedOwnerId, setSelectedOwnerId] = useState('');
    const [newOwnerName, setNewOwnerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!petName || !breed || !age) {
            onComplete({ success: false, error: "Please fill out all pet details."});
            return;
        }

        setIsLoading(true);
        let ownerId = selectedOwnerId;

        try {
            if (ownerMode === 'new') {
                if (!newOwnerName) {
                    onComplete({ success: false, error: "Please enter the new owner's name."});
                    setIsLoading(false);
                    return;
                }
                const newOwner = await addPetOwner({ name: newOwnerName, clinicId: 'c1' }); // Mock clinicId
                ownerId = newOwner.id;
            }

            if (!ownerId) {
                onComplete({ success: false, error: "Please select or create an owner."});
                setIsLoading(false);
                return;
            }

            const newPetData = {
                name: petName,
                breed,
                age: parseInt(age, 10),
                imageUrl: `https://picsum.photos/seed/${petName.toLowerCase()}/200`,
                ownerId,
                healthRecord: { vaccinations: [], allergies: [], medications: [] }
            };

            const newPet = await addPet(newPetData);
            onComplete({ success: true, data: newPet });
            onClose();

        } catch (error) {
            console.error("Failed to create pet:", error);
            onComplete({ success: false, error: "An unexpected error occurred." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Pet Record">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Pet Details</h3>
                <div>
                    <label htmlFor="petName" className="block text-sm font-medium text-gray-700">Pet Name</label>
                    <input type="text" id="petName" value={petName} onChange={e => setPetName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
                    <input type="text" id="breed" value={breed} onChange={e => setBreed(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                    <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                </div>
                
                 <h3 className="font-semibold text-lg text-gray-800 border-b pb-2 pt-4">Owner Details</h3>
                 <Tabs tabs={['Existing Owner', 'New Owner']} activeTab={ownerMode === 'existing' ? 'Existing Owner' : 'New Owner'} onTabChange={(tab) => setOwnerMode(tab === 'Existing Owner' ? 'existing' : 'new')} />

                <div className="mt-4">
                    {ownerMode === 'existing' ? (
                        <div>
                            <label htmlFor="owner-select" className="block text-sm font-medium text-gray-700">Select Owner</label>
                            <select id="owner-select" value={selectedOwnerId} onChange={e => setSelectedOwnerId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                <option value="" disabled>-- Select an owner --</option>
                                {existingOwners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                            </select>
                        </div>
                    ) : (
                         <div>
                            <label htmlFor="newOwnerName" className="block text-sm font-medium text-gray-700">New Owner's Full Name</label>
                            <input type="text" id="newOwnerName" value={newOwnerName} onChange={e => setNewOwnerName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Save Pet'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreatePetModal;
