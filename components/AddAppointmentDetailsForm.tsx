
import React, { useState, useEffect } from 'react';
import type { Attachment } from '../types';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface AddAppointmentDetailsFormProps {
  petName: string;
  initialNotes: string;
  initialAttachments: Attachment[];
  onSave: (data: { userNotes: string; attachments: Attachment[] }) => void;
  onSkip: () => void;
  onClose: () => void;
  isLoading: boolean;
  confirmText?: string;
}

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


const AddAppointmentDetailsForm: React.FC<AddAppointmentDetailsFormProps> = ({
  petName,
  initialNotes,
  initialAttachments,
  onSave,
  onSkip,
  onClose,
  isLoading,
  confirmText = 'Confirm Booking'
}) => {
  const [userNotes, setUserNotes] = useState(initialNotes);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);

  useEffect(() => {
    setUserNotes(initialNotes);
    setAttachments(initialAttachments);
  }, [initialNotes, initialAttachments]);
  
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

  const handleSave = () => {
    onSave({ userNotes, attachments });
  };

  const mediaAttachments = attachments.filter(a => a.type === 'image' || a.type === 'video');
  const recordAttachments = attachments.filter(a => a.type === 'record');

  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-4">Add Details for {petName} (Optional)</h3>
        <div>
          <label htmlFor="user-notes-form" className="block text-sm font-medium text-gray-700">Notes for the Vet</label>
          <textarea
            id="user-notes-form"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder={`e.g., ${petName} has been less active...`}
          />
        </div>
        <FileUploadSection 
          title="Upload Pictures/Videos"
          id="media-upload-form"
          accept="image/*,video/*"
          attachments={mediaAttachments}
          onFileChange={e => handleFileChange(e, 'media')}
          onRemove={handleRemoveAttachment}
        />
        <FileUploadSection 
          title="Upload Previous Medical Records"
          id="record-upload-form"
          accept=".pdf,.doc,.docx,image/*"
          attachments={recordAttachments}
          onFileChange={e => handleFileChange(e, 'record')}
          onRemove={handleRemoveAttachment}
        />
        <div className="flex justify-between items-center pt-4">
          <Button onClick={onSkip} variant="ghost" disabled={isLoading}>Skip for now</Button>
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : confirmText}
            </Button>
          </div>
        </div>
      </div>
  );
};

export default AddAppointmentDetailsForm;
