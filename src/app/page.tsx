'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Monaco Editor and Particles
const MainLayout = dynamic(() => import('@/components/MainLayout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-lg">Loading Elite Challenge Platform...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <MainLayout />;
}
