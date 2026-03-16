"use client";

import { Navbar } from "@/components/navbar";
import { VideoForm } from "@/components/video-form";

export default function NewVideoPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VideoForm />
      </main>
    </div>
  );
}
