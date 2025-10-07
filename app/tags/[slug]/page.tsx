'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import { Card, CardContent } from '@/components/ui/card';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  creator: string;
  viewCount: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function TagPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [tag, setTag] = useState<Tag | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTagVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tags/${slug}`);
        if (!response.ok) {
          throw new Error('Tag não encontrada');
        }
        const data = await response.json();
        setTag(data.tag);
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagVideos();
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <main className="min-h-screen bg-theme-primary flex flex-col items-center justify-center text-red-500">
          <p className="text-lg font-semibold">Erro ao carregar vídeos</p>
          <p>{error}</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <main className="min-h-screen bg-theme-primary">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent capitalize">
            Vídeos da Tag: {tag?.name}
          </h1>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-6">
              {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} {...video} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500">Nenhum vídeo encontrado para esta tag.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
