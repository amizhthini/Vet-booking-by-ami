import React from 'react';
import type { Vet } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface VetManagementCardProps {
  vet: Vet;
  onManage: (vet: Vet) => void;
}

const VetManagementCard: React.FC<VetManagementCardProps> = ({ vet, onManage }) => {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          className="h-20 w-20 rounded-full object-cover"
          src={vet.imageUrl}
          alt={vet.name}
        />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">{vet.name}</h3>
          <p className="text-teal-600 font-medium">{vet.specialty}</p>
          <p className="text-sm text-gray-500 mt-1">
            {vet.clinicName} | {vet.location}
          </p>
        </div>
        <div className="w-full sm:w-auto">
            <Button onClick={() => onManage(vet)} className="w-full sm:w-auto">Manage</Button>
        </div>
      </div>
    </Card>
  );
};

export default VetManagementCard;
