import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import { getVets } from '../services/mockDataService';
import type { Vet } from '../types';
import Spinner from '../components/ui/Spinner';
import VetManagementCard from '../components/VetManagementCard';

interface VetManagementPageProps {
    viewVetProfile: (vet: Vet) => void;
}

const VetManagementPage: React.FC<VetManagementPageProps> = ({ viewVetProfile }) => {
    const [allVets, setAllVets] = useState<Vet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // In a real app, this would come from the logged-in user's context
    const clinicId = 'c1'; 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const vetData = await getVets();
                setAllVets(vetData);
            } catch (error) {
                console.error("Failed to fetch vets:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const clinicVets = useMemo(() => {
        return allVets.filter(vet => vet.clinicId === clinicId);
    }, [allVets, clinicId]);

    if (isLoading) {
        return (
            <PageWrapper title="Vet Management">
                <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            </PageWrapper>
        );
    }
    
    return (
        <PageWrapper title="Vet Management">
            <div className="space-y-4">
                {clinicVets.length > 0 ? (
                    clinicVets.map(vet => (
                        <VetManagementCard 
                            key={vet.id} 
                            vet={vet}
                            onManage={viewVetProfile}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">No veterinarians found for this clinic.</p>
                )}
            </div>
        </PageWrapper>
    );
};

export default VetManagementPage;
