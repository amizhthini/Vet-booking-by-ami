import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { getClinics } from '../services/mockDataService';
import type { Clinic } from '../types';

interface ClinicProfilePageProps {}

const ClinicProfilePage: React.FC<ClinicProfilePageProps> = () => {
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const clinicId = 'c1'; // Mock for demo

    useEffect(() => {
        getClinics().then(clinics => {
            const currentClinic = clinics.find(c => c.id === clinicId);
            setClinic(currentClinic || null);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    const handleViewPublicWebsite = () => {
        if (!clinic) return;
        const url = new URL(window.location.origin);
        url.searchParams.set('view', 'clinic');
        url.searchParams.set('id', clinic.id);
        window.open(url.toString(), '_blank');
    };

    if (isLoading) {
        return (
            <PageWrapper title="Clinic Profile">
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </PageWrapper>
        );
    }

    if (!clinic) {
        return <PageWrapper title="Clinic Profile"><p>Clinic not found.</p></PageWrapper>;
    }

    return (
        <PageWrapper title="Clinic Profile">
            <Card>
                <div className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800">{clinic.name}</h2>
                    <p className="text-gray-500 mt-2">{clinic.address}</p>
                    <p className="mt-4 text-gray-600">This is your clinic's management page. From here, you can access tools to manage your clinic's public presence.</p>
                    <Button className="mt-6" size="lg" onClick={handleViewPublicWebsite}>
                        View Public Website
                    </Button>
                </div>
            </Card>
        </PageWrapper>
    );
};

export default ClinicProfilePage;
