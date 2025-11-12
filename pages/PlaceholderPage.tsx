import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <PageWrapper title={title}>
      <Card>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800">Coming Soon!</h2>
          <p className="mt-2 text-gray-500">The "{title}" page is under construction.</p>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default PlaceholderPage;