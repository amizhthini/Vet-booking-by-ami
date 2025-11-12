
import React from 'react';
import type { SoapNote } from '../types';

interface SoapNotesViewerProps {
    notes: SoapNote;
}

const NoteSection: React.FC<{ title: string, content: string }> = ({ title, content }) => (
    <div>
        <h4 className="font-bold text-teal-700 text-sm uppercase tracking-wider">{title}</h4>
        <p className="text-gray-600 mt-1">{content}</p>
    </div>
);


const SoapNotesViewer: React.FC<SoapNotesViewerProps> = ({ notes }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Consultation Notes</h3>
            <div className="space-y-4">
                <NoteSection title="Subjective" content={notes.subjective} />
                <NoteSection title="Objective" content={notes.objective} />
                <NoteSection title="Assessment" content={notes.assessment} />
                <NoteSection title="Plan" content={notes.plan} />
            </div>
        </div>
    );
};

export default SoapNotesViewer;
