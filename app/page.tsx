import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Landing from '@/components/Landing';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Landing />
      </main>
      <Footer />
    </div>
  );
}
