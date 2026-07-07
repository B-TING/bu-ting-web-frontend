import { Suspense } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Landing from '@/components/Landing';
import { MissingTravelSurveyModal } from '@/app/components/missing-travel-survey-modal';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Landing />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <MissingTravelSurveyModal />
      </Suspense>
    </div>
  );
}
