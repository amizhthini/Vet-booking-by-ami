import React, { useState } from 'react';
import type { Appointment, SoapNote } from '../types';
import { Page } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { generateSoapNotesFromTranscript } from '../services/geminiService';
import { updateAppointment, autoBookFollowUp } from '../services/mockDataService';
import { MOCK_TRANSCRIPT } from '../constants';
import SoapNotesViewer from '../components/SoapNotesViewer';
import { MicrophoneIcon, StopIcon } from '../constants';
import Toast from '../components/ui/Toast';

interface ConsultationPageProps {
  appointment: Appointment;
  navigateTo: (page: Page) => void;
}

const ConsultationPage: React.FC<ConsultationPageProps> = ({ appointment, navigateTo }) => {
  const { recorderState, startRecording, stopRecording, audioResult, error: recorderError } = useAudioRecorder();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<SoapNote | null>(appointment.notes || null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  const handleGenerateNotes = async () => {
    // In a real app, you would use a speech-to-text API on audioResult.audioBlob.
    // For this demo, we use a mock transcript.
    if (!MOCK_TRANSCRIPT) {
        alert("No audio recorded or transcript available.");
        return;
    }
    
    setIsGenerating(true);
    setApiError(null);
    
    try {
        const notes = await generateSoapNotesFromTranscript(MOCK_TRANSCRIPT);
        setGeneratedNotes(notes);
        await updateAppointment(appointment.id, { notes });

        if (notes.followUp) {
            try {
                const newAppointment = await autoBookFollowUp(appointment.pet, appointment.vet, notes.followUp);
                if (newAppointment) {
                    setToast({ 
                        message: `Follow-up for ${newAppointment.pet.name} automatically booked with ${newAppointment.vet.name} on ${newAppointment.date} at ${newAppointment.time}.`, 
                        type: 'success' 
                    });
                } else {
                     setToast({ message: 'A follow-up was suggested, but no available slots were found.', type: 'error' });
                }
            } catch (bookingError: any) {
                console.error("Auto-booking failed:", bookingError);
                setToast({ message: `Follow-up booking failed: ${bookingError.message}`, type: 'error' });
            }
        }

    } catch (err: any) {
        setApiError(err.message || "An unknown error occurred.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <PageWrapper title={`Consultation for ${appointment.pet.name}`}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Consultation Controls</h2>
          <div className="p-4 border-l-4 border-teal-500 bg-teal-50 mb-6">
            <h3 className="font-semibold text-teal-800">Patient Details</h3>
            <p className="text-teal-700">{appointment.pet.name} - {appointment.pet.breed}, {appointment.pet.age} years old</p>
          </div>

          <div className="space-y-4">
            {recorderState !== 'recording' ? (
                // FIX: The `disabled` condition was impossible since this button only renders when `recorderState` is NOT 'recording'.
                // The button should be disabled while waiting for microphone permission.
                <Button onClick={startRecording} disabled={recorderState === 'permission'} className="w-full">
                    <MicrophoneIcon className="w-5 h-5 mr-2" />
                    Start Recording
                </Button>
            ) : (
                <Button onClick={stopRecording} variant="danger" className="w-full">
                    <StopIcon className="w-5 h-5 mr-2" />
                    Stop Recording
                </Button>
            )}

            {recorderState === 'recording' && <p className="text-center text-red-500 animate-pulse">Recording...</p>}
            {recorderError && <p className="text-center text-red-500">Error: {recorderError}</p>}
            {audioResult.audioUrl && recorderState === 'stopped' && (
                <div className="text-center">
                    <p className="text-green-600 font-semibold mb-2">Recording complete!</p>
                    <audio src={audioResult.audioUrl} controls className="w-full" />
                </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">
                  Once recording is complete, generate AI-powered notes.
                  <span className="font-semibold text-gray-800"> (For demo purposes, this uses a pre-written transcript).</span>
              </p>
              <Button 
                onClick={handleGenerateNotes} 
                disabled={recorderState !== 'stopped' || isGenerating}
                className="w-full"
              >
                {isGenerating ? <Spinner size="sm" /> : "Generate SOAP Notes"}
              </Button>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">AI Generated Notes</h2>
          {isGenerating && (
            <div className="flex flex-col items-center justify-center h-full">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-500">Generating notes, please wait...</p>
            </div>
          )}
          {apiError && <p className="text-red-500">{apiError}</p>}
          {generatedNotes && <SoapNotesViewer notes={generatedNotes} />}
          {!isGenerating && !generatedNotes && <p className="text-gray-500">Notes will appear here once generated.</p>}

          {generatedNotes && (
            <div className="mt-6 text-right">
                <Button onClick={() => navigateTo(Page.Appointments)}>Finish & View All Appointments</Button>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default ConsultationPage;