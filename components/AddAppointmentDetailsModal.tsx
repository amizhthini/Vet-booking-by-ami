import React, { useState, useEffect } from 'react';
import type { Appointment, Attachment } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface AddAppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentId: string, data: { userNotes?: string; attachments?: Attachment[] }) => Promise<void>;
}

const AddAppointmentDetailsModal: React.FC<AddAppointmentDetailsModalProps> = ({ appointment, isOpen, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.userNotes || '');
      setAttachments(appointment.attachments || []);
    }
  }, [appointment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'record') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          name: file.name,
          type: type === 'media' ? (file.type.startsWith('image/') ? 'image' : 'video') : 'record',
          url: event.target?.result as string,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  
  const handleRemoveAttachment = (urlToRemove: string) => {
    setAttachments(prev => prev.filter(file => file.url !== urlToRemove));
  };

  const handleSave = async () => {
    if (!appointment) return;
    setIsLoading(true);
    await onSave(appointment.id, { userNotes: notes, attachments });
    setIsLoading(false);
    onClose();
  };
  
  if (!appointment) return null;

  const mediaAttachments = attachments.filter(a => a.type === 'image' || a.type === 'video');
  const recordAttachments = attachments.filter(a => a.type === 'record');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Details for ${appointment.pet.name}'s Appointment`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="user-notes" className="block text-sm font-medium text-gray-700">Notes for the Vet</label>
          <textarea
            id="user-notes"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`e.g., ${appointment.pet.name} has been less active...`}
          />
        </div>
        <FileUploadSection 
          title="Upload Pictures/Videos"
          id="media-upload"
          accept="image/*,video/*"
          attachments={mediaAttachments}
          onFileChange={e => handleFileChange(e, 'media')}
          onRemove={handleRemoveAttachment}
        />
        <FileUploadSection 
          title="Upload Previous Medical Records"
          id="record-upload"
          accept=".pdf,.doc,.docx,image/*"
          attachments={recordAttachments}
          onFileChange={e => handleFileChange(e, 'record')}
          onRemove={handleRemoveAttachment}
        />
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Save Details'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const FileUploadSection: React.FC<{
    title: string;
    id: string;
    accept: string;
    attachments: Attachment[];
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (url: string) => void;
}> = ({ title, id, accept, attachments, onFileChange, onRemove }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600"><label htmlFor={id} className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"><span>Upload a file</span><input id={id} name={id} type="file" className="sr-only" onChange={onFileChange} accept={accept} /></label></div>
            </div>
        </div>
        {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
                {attachments.map((file) => (
                    <div key={file.url} className="flex items-center justify-between p-1.5 bg-gray-100 rounded-md text-sm">
                        <span className="text-gray-700 truncate">{file.name}</span>
                        <button onClick={() => onRemove(file.url)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                    </div>
                ))}
            </div>
        )}
    </div>
);


export default AddAppointmentDetailsModal;