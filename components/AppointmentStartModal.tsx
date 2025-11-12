import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { Appointment } from '../types';

interface AppointmentStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  appointment: Appointment | null;
}

const AppointmentStartModal: React.FC<AppointmentStartModalProps> = ({ isOpen, onClose, onJoin, appointment }) => {
  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Consultation Starting!">
      <div className="text-center">
        <p className="text-lg">
            Your {appointment.type} consultation for <span className="font-bold">{appointment.pet.name}</span> with <span className="font-bold">{appointment.vet.name}</span> is starting now.
        </p>
        <div className="mt-6 flex justify-center space-x-2">
            <Button onClick={onClose} variant="secondary">Dismiss</Button>
            <Button onClick={onJoin} size="lg">Join Consultation</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentStartModal;
