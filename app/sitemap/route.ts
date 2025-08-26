import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import { prisma } from '@/lib/prisma';
import { getDomainConfig } from '@/config/domains';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';

// Lista de todos os domínios suportados
const supportedDomains = [
  'cornofilmando.com',
  'cornomanso.com.br',
  'cornoplay.com',
  'cornosbrasil.com',
  'cornostv.com',
  'cornosvip.com',
  'cornotube.com',
  'cornovideos.com',
  'esposadecorno.com',
  'esposagozando.com',
  'esposasafada.com',
  'maridocorno.com',
  'mulherdecorno.com',
  'mulherdocorno.com',
  'videosdecorno.com',
  'localhost:3000'
];

// Apenas português brasileiro
const languages = ['pt'];

export async function GET(request: Request) {
  try {
    // Obtém o hostname da URL da requisição (sem protocolo e sem caminho)
    const hostname = request.headers.get('x-forwarded-host') || new URL(request.url).hostname;

    // Verificar se o domínio acessado é um dos domínios suportados
    const isKnownDomain = supportedDomains.includes(hostname) || hostname === 'localhost';

    if (!isKnownDomain) {
      return new NextResponse('Domínio desconhecido.', { status: 400 });
    }

    // Usar o PrismaClient padrão

    // Cria o stream do sitemap com o domínio específico
    const sitemapStream = new SitemapStream({ hostname: `https://${hostname}` });

    // Buscar vídeos dinâmicos (não premium) com mais informações
    const dynamicRoutes = await prisma.video.findMany({
      where: { premium: false },
      select: { 
        url: true, 
        url_en: true, 
        url_es: true,
        title: true,
        category: true,
        created_at: true,
        updated_at: true
      },
    }) || [];

    // Buscar categorias e tags
    const categories = await prisma.category.findMany({ select: { slug: true } }) || [];
    const tags = await prisma.tag.findMany({ select: { slug: true } }) || [];

    // Links estáticos do sitemap
    const staticLinks = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/videos', changefreq: 'hourly', priority: 0.9 },
      { url: '/search', changefreq: 'daily', priority: 0.8 },
      { url: '/creators', changefreq: 'daily', priority: 0.8 },
      { url: '/premium', changefreq: 'weekly', priority: 0.7 },
      { url: '/login', changefreq: 'monthly', priority: 0.6 },
      { url: '/register', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.5 },
      { url: '/faq', changefreq: 'monthly', priority: 0.5 },
      { url: '/terms', changefreq: 'monthly', priority: 0.4 },
      { url: '/privacy', changefreq: 'monthly', priority: 0.4 },
      { url: '/dmca', changefreq: 'monthly', priority: 0.4 },
      { url: '/remocao', changefreq: 'monthly', priority: 0.4 },
      { url: '/support', changefreq: 'monthly', priority: 0.5 },
    ];

    const links = [];

    // Gerar URLs para cada idioma
    for (const lang of languages) {
      // Links estáticos específicos para o idioma
      const baseLinks = staticLinks.map((link) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}${link.url}`,
        changefreq: link.changefreq,
        priority: link.priority,
      }));

      // Links dinâmicos (vídeos) com prioridades baseadas na categoria
      const videoLinks = dynamicRoutes.flatMap((route: any) => {
        // Determinar prioridade baseada na categoria
        let priority = 0.8;
        if (route.category && route.category.includes('VIP')) {
          priority = 0.9;
        } else if (route.category && route.category.includes('AMADORES')) {
          priority = 0.85;
        }
        
        // Determinar frequência de mudança baseada na data de atualização
        let changefreq = 'weekly';
        if (route.updated_at) {
          const daysSinceUpdate = Math.floor((Date.now() - new Date(route.updated_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceUpdate < 7) {
            changefreq = 'daily';
          } else if (daysSinceUpdate < 30) {
            changefreq = 'weekly';
          } else {
            changefreq = 'monthly';
          }
        }

        const videoLinks = [
          { 
            url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/video/${route.url}`, 
            changefreq: changefreq, 
            priority: priority,
            lastmod: route.updated_at ? new Date(route.updated_at).toISOString() : undefined
          },
        ];

        if (lang === 'en' && route.url_en) {
          videoLinks.push({ 
            url: `https://${hostname}/en/video/${route.url_en}`, 
            changefreq: changefreq, 
            priority: priority,
            lastmod: route.updated_at ? new Date(route.updated_at).toISOString() : undefined
          });
        }

        if (lang === 'es' && route.url_es) {
          videoLinks.push({ 
            url: `https://${hostname}/es/video/${route.url_es}`, 
            changefreq: changefreq, 
            priority: priority,
            lastmod: route.updated_at ? new Date(route.updated_at).toISOString() : undefined
          });
        }

        return videoLinks;
      });

      // Links para categorias
      const categoryLinks = categories.map((category: any) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/categories/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
      }));

      // Links para tags
      const tagLinks = tags.map((tag: any) => ({
        url: `https://${hostname}${lang !== 'pt' ? `/${lang}` : ''}/tag/${tag.slug}`,
        changefreq: 'weekly',
        priority: 0.6,
      }));

      // Combina todos os links (estáticos, dinâmicos, categorias e tags)
      links.push(...baseLinks, ...videoLinks, ...categoryLinks, ...tagLinks);
    }

    // Escreve os links no stream do sitemap
    links.forEach((link) => sitemapStream.write(link));
    sitemapStream.end();

    // Converte o stream para uma string e retorna o sitemap gerado
    const sitemapOutput = await streamToPromise(sitemapStream).then((data) => data.toString());

    return new NextResponse(sitemapOutput, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Erro ao gerar o sitemap:', error);
    return new NextResponse('Erro ao gerar o sitemap', { status: 500 });
  }
}
