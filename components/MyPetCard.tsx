import React from 'react';
import type { Pet } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface MyPetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

const MyPetCard: React.FC<MyPetCardProps> = ({ pet, onEdit }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex-grow">
        <img
          className="h-48 w-full object-cover rounded-t-xl"
          src={pet.imageUrl}
          alt={pet.name}
        />
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
          <p className="text-gray-600">{pet.breed}</p>
          <p className="text-sm text-gray-500 mt-1">{pet.age} years old</p>
        </div>
      </div>
      <div className="p-4 border-t mt-auto">
        <Button onClick={() => onEdit(pet)} variant="secondary" className="w-full">
          Edit Profile
        </Button>
      </div>
    </Card>
  );
};

export default MyPetCard;
