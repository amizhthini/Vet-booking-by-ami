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
  onReschedule?: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStartConsultation, onAddDetails, onReschedule, onCancel }) => {
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

  const getCanReschedule = () => {
    if (status !== 'Upcoming') return false;
    const [time, modifier] = appointment.time.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    const appointmentDateTime = new Date(`${appointment.date}T${hours.padStart(2, '0')}:${minutes}:00`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference > 6;
  };

  const canReschedule = getCanReschedule();

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
                     <div className="flex items-center flex-wrap justify-end gap-2 pt-2">
                        <Button onClick={() => onAddDetails(appointment)} size="sm" variant="secondary">
                            Add/Edit Details
                        </Button>
                         {canReschedule && (
                            <>
                                {onReschedule && (
                                    <Button onClick={() => onReschedule(appointment)} size="sm" variant="ghost">
                                        Reschedule
                                    </Button>
                                )}
                                <Button onClick={() => onCancel(appointment)} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 focus:ring-red-500">
                                    Cancel
                                </Button>
                            </>
                        )}
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