import React from 'react';
import { Button } from '../components/ui/button';
import { useRouter } from '../components/Router';

export default function PhonePeComingSoon() {
  const { navigate } = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full text-center">
  <h1 className="text-2xl font-semibold mb-3">Payment gateway integration in progress</h1>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')} className="bg-gutzo-primary text-white">Return to store</Button>
        </div>
      </div>
    </div>
  );
}
