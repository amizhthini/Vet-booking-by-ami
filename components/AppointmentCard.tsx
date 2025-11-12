import React, { useState } from 'react';
import type { Appointment } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { CalendarIcon, VideoCameraIcon } from '../constants';
import CompletedAppointmentDetails from './CompletedAppointmentDetails';

interface AppointmentCardProps {
  appointment: Appointment;
  onStartConsultation: (appointment: Appointment) => void;
  onAddDetails: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStartConsultation, onAddDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { status, type } = appointment;
  const isUpcoming = status === 'Upcoming';
  const isCompleted = status === 'Completed';
  const isVirtual = type === 'Virtual';

  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusStyles = {
    Upcoming: 'bg-green-100 text-green-800',
    Completed: 'bg-gray-200 text-gray-700',
    Cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <Card className={`mb-4 transition-all duration-300 ${!isUpcoming ? 'bg-gray-50' : 'bg-white'}`}>
        <div 
            className={`flex flex-col sm:flex-row justify-between sm:items-center ${isCompleted ? 'cursor-pointer hover:bg-gray-100 -m-6 p-6 rounded-xl' : ''}`}
            onClick={isCompleted ? () => setIsExpanded(!isExpanded) : undefined}
        >
            <div className="flex items-center space-x-4">
                <img src={appointment.pet.imageUrl} alt={appointment.pet.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{appointment.pet.name}'s {appointment.type}</h3>
                    <p className="text-sm text-gray-600">with {appointment.vet.name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        <span>{formattedDate} at {appointment.time}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status]}`}>
                    {appointment.status}
                </span>
                {isUpcoming && (
                     <div className="flex items-center space-x-2">
                        <Button onClick={() => onAddDetails(appointment)} size="sm" variant="secondary">
                            Add/Edit Details
                        </Button>
                        {isVirtual && (
                            <Button onClick={() => onStartConsultation(appointment)} size="sm">
                                <VideoCameraIcon className="w-5 h-5 mr-2" />
                                Start
                            </Button>
                        )}
                    </div>
                )}
                 {isCompleted && (
                    <span className="text-xs text-gray-500 mt-2">Click to view details</span>
                )}
            </div>
        </div>
        {isExpanded && isCompleted && (
            <CompletedAppointmentDetails appointment={appointment} />
        )}
    </Card>
  );
};

export default AppointmentCard;