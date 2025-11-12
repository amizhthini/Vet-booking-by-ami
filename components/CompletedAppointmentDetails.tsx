import React, { useState } from 'react';
import type { Appointment, Prescription, FollowUp } from '../types';
import Tabs from './ui/Tabs';
import SoapNotesViewer from './SoapNotesViewer';

const PrescriptionViewer: React.FC<{ prescriptions: Prescription[] }> = ({ prescriptions }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {prescriptions.map((p, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.medication}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dosage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.frequency}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const FollowUpViewer: React.FC<{ followUp: FollowUp }> = ({ followUp }) => (
    <div>
        <h4 className="font-bold text-teal-700 text-sm uppercase tracking-wider">Next Appointment</h4>
        <p className="text-gray-600 mt-1">
            <strong>Date:</strong> {new Date(followUp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {followUp.time}
        </p>
        <p className="text-gray-600 mt-1">
            <strong>Reason:</strong> {followUp.reason}
        </p>
        {followUp.referredVetName && (
             <p className="text-gray-600 mt-1">
                <strong>Referred to:</strong> {followUp.referredVetName}
            </p>
        )}
    </div>
);

interface CompletedAppointmentDetailsProps {
    appointment: Appointment;
}

const CompletedAppointmentDetails: React.FC<CompletedAppointmentDetailsProps> = ({ appointment }) => {
    const [activeTab, setActiveTab] = useState('Consultation Notes');
    
    const tabs = ['Consultation Notes'];
    if (appointment.prescriptions && appointment.prescriptions.length > 0) tabs.push('Prescriptions');
    if (appointment.notes?.followUp) tabs.push('Follow-up');

    return (
        <div className="mt-4 pt-4 border-t">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-4 p-2">
                {activeTab === 'Consultation Notes' && appointment.notes && (
                    <SoapNotesViewer notes={appointment.notes} />
                )}
                {activeTab === 'Prescriptions' && appointment.prescriptions && (
                    <PrescriptionViewer prescriptions={appointment.prescriptions} />
                )}
                {activeTab === 'Follow-up' && appointment.notes?.followUp && (
                    <FollowUpViewer followUp={appointment.notes.followUp} />
                )}
            </div>
        </div>
    );
};

export default CompletedAppointmentDetails;