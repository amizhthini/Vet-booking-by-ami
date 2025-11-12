import React from 'react';
import type { Referral } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface ReferralCardProps {
    referral: Referral;
    onBook: (referral: Referral) => void;
}

const ReferralCard: React.FC<ReferralCardProps> = ({ referral, onBook }) => {
    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                         <img src={referral.pet.imageUrl} alt={referral.pet.name} className="w-12 h-12 rounded-full object-cover" />
                         <div>
                            <h3 className="text-lg font-bold text-gray-800">Referral for {referral.pet.name}</h3>
                            <p className="text-sm text-gray-500">
                                Sent on {new Date(referral.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                     <p className="text-sm mt-3">
                        <span className="font-semibold text-gray-600">From:</span> {referral.fromVet.name}
                    </p>
                     <p className="text-sm">
                        <span className="font-semibold text-gray-600">To:</span> {referral.toVet.name} ({referral.toVet.specialty})
                    </p>
                    <p className="text-sm mt-3 p-3 bg-gray-50 rounded-md border">
                       <span className="font-semibold text-gray-600">Notes:</span> {referral.notes}
                    </p>
                </div>
                <div className="sm:ml-6 flex flex-col items-end space-y-2">
                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${referral.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {referral.status}
                    </span>
                    {referral.status === 'Pending' && (
                        <Button onClick={() => onBook(referral)}>Book Appointment</Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

export default ReferralCard;
