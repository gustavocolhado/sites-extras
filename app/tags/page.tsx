'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tag as TagIcon, Search, ArrowDownAZ, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import Section from '@/components/Section';

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
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'count'>('alpha');

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
        <Section background="white" padding="lg">
          <h1 className="text-3xl font-bold mb-4 text-theme-primary">Todas as Tags</h1>

          {/* Filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center bg-white dark:bg-black rounded-lg overflow-hidden border border-theme-input">
              <Search className="w-4 h-4 text-theme-secondary mx-3" />
              <input
                type="text"
                placeholder="Buscar tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent py-2 pr-3 focus:outline-none text-theme-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('alpha')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${sortBy === 'alpha' ? 'border-accent-red text-accent-red' : 'border-theme-input text-theme-secondary hover:text-theme-primary'}`}
                aria-pressed={sortBy === 'alpha'}
              >
                <ArrowDownAZ className="w-4 h-4" />
                <span className="text-sm">A–Z</span>
              </button>
              <button
                onClick={() => setSortBy('count')}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${sortBy === 'count' ? 'border-accent-red text-accent-red' : 'border-theme-input text-theme-secondary hover:text-theme-primary'}`}
                aria-pressed={sortBy === 'count'}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">Popular</span>
              </button>
            </div>
          </div>

          <Card className="bg-theme-card border border-theme-border-primary shadow-sm">
            <CardContent className="p-4 sm:p-6">
              {(() => {
                const normalized = query.trim().toLowerCase();
                const filtered = tags
                  .filter(t => !normalized || t.name.toLowerCase().includes(normalized))
                  .sort((a, b) => sortBy === 'alpha'
                    ? a.name.localeCompare(b.name)
                    : b.qtd - a.qtd
                  );

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <TagIcon className="w-10 h-10 text-theme-muted mx-auto mb-3" />
                      <p className="text-theme-secondary">Nenhuma tag encontrada</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filtered.map((tag) => (
                      <Link href={`/tags/${tag.slug}`} key={tag.id} aria-label={`Abrir tag ${tag.name}`}>
                        <div className="flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer border border-theme-border-primary bg-theme-primary/5 hover:bg-theme-hover">
                          <TagIcon className="w-5 h-5 text-accent-red mr-3 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-theme-primary capitalize truncate">{tag.name}</p>
                            <span className="inline-flex items-center text-xs text-theme-secondary mt-0.5">
                              {tag.qtd} vídeos
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </Section>
      </main>
    </Layout>
  );
}
