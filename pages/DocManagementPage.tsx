import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import { getPets, getVets, addReport } from '../services/mockDataService';
import { analyzeDocument } from '../services/geminiService';
import type { Pet, Vet, Report, ConsultationReport, PrescriptionReport, PawScanReport } from '../types';
import { useAuth } from '../hooks/useAuth';

type LoadingState = 'idle' | 'analyzing' | 'confirming' | 'saving';

const DocManagementPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [allPets, setAllPets] = useState<Pet[]>([]);
    const [allVets, setAllVets] = useState<Vet[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<string>('');
    const [selectedVetId, setSelectedVetId] = useState<string>('');
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [aiResult, setAiResult] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        // Fetch pets and vets for dropdowns
        Promise.all([getPets(), getVets()]).then(([petsData, vetsData]) => {
            setAllPets(petsData);
            setAllVets(vetsData);
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create a preview URL for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyze = async () => {
        if (!file || !selectedPetId) {
            setToast({ message: "Please select a file and a pet.", type: 'error' });
            return;
        }
        setLoadingState('analyzing');
        try {
            const base64Data = await fileToBase64(file);
            const result = await analyzeDocument({ mimeType: file.type, data: base64Data });
            setAiResult(result);
            setLoadingState('confirming');
        } catch (error: any) {
            setToast({ message: error.message || 'Analysis failed.', type: 'error' });
            setLoadingState('idle');
        }
    };
    
    const handleConfirmSave = async () => {
        if (!aiResult || !selectedPetId) return;
        setLoadingState('saving');
        
        const commonData = {
            petId: selectedPetId,
            date: aiResult.date ? new Date(aiResult.date).toISOString() : new Date().toISOString(),
        };

        const createAndSaveReport = () => {
            switch (aiResult.documentType) {
                case 'SOAP Note': {
                    const reportData: Omit<ConsultationReport, 'id'> = { ...commonData, type: 'Consultation', summary: aiResult.summary, vetName: aiResult.details?.vetName || 'N/A' };
                    return addReport(reportData);
                }
                case 'Prescription': {
                    const reportData: Omit<PrescriptionReport, 'id'> = { ...commonData, type: 'Prescription', medications: aiResult.details?.medications || [], vetName: aiResult.details?.vetName || 'N/A' };
                    return addReport(reportData);
                }
                case 'Radiography Report': {
                     const reportData: Omit<PawScanReport, 'id'> = { ...commonData, type: 'PawScan', summary: aiResult.summary, dataUrl: filePreview || '#' };
                     return addReport(reportData);
                }
                default: {
                    // For 'Lab Result', 'Other', etc. we can save as a generic scan for now
                    const reportData: Omit<PawScanReport, 'id'> = { ...commonData, type: 'PawScan', summary: aiResult.summary, dataUrl: filePreview || '#' };
                    return addReport(reportData);
                }
            }
        };

        try {
            await createAndSaveReport();
            setToast({ message: 'Document saved successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to save document.', type: 'error' });
        } finally {
            // Reset state
            setLoadingState('idle');
            setFile(null);
            setFilePreview(null);
            setAiResult(null);
            setSelectedPetId('');
        }
    };

    const isClinicAdmin = user?.role === 'Clinic Admin';

    return (
        <PageWrapper title="Document Management">
             {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Upload and selection */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Upload New Document</h2>
                        
                        <div>
                            <label htmlFor="pet-select" className="block text-sm font-medium text-gray-700">Select Pet (Patient)</label>
                            <select id="pet-select" value={selectedPetId} onChange={e => setSelectedPetId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                <option value="" disabled>-- Select a pet --</option>
                                {allPets.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                            </select>
                        </div>

                        {isClinicAdmin && (
                            <div>
                                <label htmlFor="vet-select" className="block text-sm font-medium text-gray-700">Select Vet (Optional)</label>
                                <select id="vet-select" value={selectedVetId} onChange={e => setSelectedVetId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
                                    <option value="">-- All Vets --</option>
                                    {allVets.map(vet => <option key={vet.id} value={vet.id}>{vet.name}</option>)}
                                </select>
                            </div>
                        )}
                        
                        <div>
                             <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Document File</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} /></label></div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                         <Button onClick={handleAnalyze} disabled={loadingState === 'analyzing' || !file || !selectedPetId} className="w-full">
                            {loadingState === 'analyzing' ? <div className="flex items-center justify-center"><Spinner size="sm" className="mr-2" /> Analyzing...</div> : 'Upload & Analyze'}
                        </Button>
                    </div>

                    {/* Right side: Preview */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
                        <div className="mt-2 w-full h-80 bg-gray-100 rounded-md flex items-center justify-center border">
                            {filePreview ? (
                                <img src={filePreview} alt="File preview" className="max-h-full max-w-full object-contain" />
                            ) : file ? (
                                <p className="text-gray-500">{file.name}</p>
                            ) : (
                                <p className="text-gray-500">Select a file to see a preview</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Confirmation Modal */}
            <Modal isOpen={loadingState === 'confirming'} onClose={() => setLoadingState('idle')} title="Confirm Document Details">
                {aiResult && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">AI has analyzed the document. Please review and confirm the details below before saving.</p>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Document Type</label>
                            <input type="text" value={aiResult.documentType} readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Summary</label>
                            <textarea rows={3} defaultValue={aiResult.summary} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" defaultValue={aiResult.date} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="secondary" onClick={() => setLoadingState('idle')}>Cancel</Button>
                            <Button onClick={handleConfirmSave} disabled={loadingState === 'saving'}>
                                {loadingState === 'saving' ? <Spinner size="sm" /> : 'Confirm & Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </PageWrapper>
    );
};

export default DocManagementPage;
