import React from 'react';
import type { Vet } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface VetCardProps {
  vet: Vet;
  onBook: (vet: Vet) => void;
}

const VetCard: React.FC<VetCardProps> = ({ vet, onBook }) => {
  return (
    <Card className="transition-transform transform hover:scale-105 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          className="h-24 w-24 rounded-full object-cover"
          src={vet.imageUrl}
          alt={`Dr. ${vet.name}`}
        />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">{vet.name}</h3>
          <p className="text-teal-600 font-medium">{vet.specialty}</p>
          <p className="text-sm text-gray-500 mt-1">
            {vet.clinicName === 'Independent' ? `Independent | ${vet.location}` : `${vet.clinicName} | ${vet.location}`}
          </p>
          <div className="flex items-center justify-center sm:justify-start mt-2 space-x-1 text-yellow-500">
            {Array.from({ length: Math.round(vet.rating) }).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="text-gray-600 text-sm ml-2">{vet.rating} ({vet.reviewCount} reviews)</span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
            <Button onClick={() => onBook(vet)} className="w-full sm:w-auto">Book Now</Button>
        </div>
      </div>
    </Card>
  );
};

export default VetCard;