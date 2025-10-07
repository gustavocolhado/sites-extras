'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Header from '@/components/Header';

interface Tag {
  id: string;
  name: string;
  slug: string;
  qtd: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Falha ao carregar as tags');
        }
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p className="text-lg font-semibold">Erro ao carregar tags</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Layout>
      <Header />
      <main className="min-h-screen bg-theme-primary">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Todas as Tags
          </h1>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tags.map((tag) => (
                  <Link href={`/tags/${tag.slug}`} key={tag.id}>
                    <div className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-indigo-100 hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200">
                      <TagIcon className="w-5 h-5 text-indigo-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 capitalize">{tag.name}</p>
                        <p className="text-xs text-slate-500">{tag.qtd} vídeos</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
}
