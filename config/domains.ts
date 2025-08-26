export interface DomainConfig {
  name: string
  title: string
  description: string
  keywords: string[]
  logo: string
  favicon: string
  primaryColor: string
  theme: 'dark' | 'light'
  canonical: string
  ogImage: string
  siteName: string
}

export const domainConfigs: Record<string, DomainConfig> = {
  'cornofilmando.com': {
    name: 'Corno Filmando',
    title: 'CORNO FILMANDO - Videos de Cornos Filmando suas Mulheres',
    description: 'Videos de cornos filmando suas mulheres com outros homens. Sexo amador real, filmagens caseiras de traição. CORNO FILMANDO - O melhor conteúdo de filmagens de corno.',
    keywords: [
      'corno filmando',
      'videos de corno',
      'filmagens caseiras',
      'sexo amador',
      'traição filmada',
      'cornos filmando',
      'videos caseiros',
      'sexo real',
      'filmagens reais',
      'traição real'
    ],
    logo: '/imgs/logo-filmando.png',
    favicon: '/favicon-filmando.png',
    primaryColor: '#3498db',
    theme: 'dark',
    canonical: 'https://cornofilmando.com',
    ogImage: '/imgs/og-filmando.jpg',
    siteName: 'CORNO FILMANDO'
  },
  'cornomanso.com.br': {
    name: 'Corno Manso',
    title: 'CORNO MANSO - Videos de Cornos Submissos e Mansos',
    description: 'Videos de cornos mansos e submissos. Sexo amador com cornos que gostam de ser humilhados. CORNO MANSO - O site dos cornos mais mansos do Brasil.',
    keywords: [
      'corno manso',
      'cornos submissos',
      'humilhação de corno',
      'sexo amador',
      'cornos mansos',
      'submissão',
      'humilhação',
      'sexo real',
      'videos de corno',
      'cornos brasileiros'
    ],
    logo: '/imgs/logo-manso.png',
    favicon: '/favicon-manso.png',
    primaryColor: '#9b59b6',
    theme: 'dark',
    canonical: 'https://cornomanso.com.br',
    ogImage: '/imgs/og-manso.jpg',
    siteName: 'CORNO MANSO'
  },
  'cornoplay.com': {
    name: 'Corno Play',
    title: 'CORNO PLAY - Videos Porno de Cornos Brasileiros',
    description: 'Videos porno de cornos brasileiros. Sexo amador, videos de traição e muito mais. CORNO PLAY - O melhor site de videos porno de corno.',
    keywords: [
      'corno play',
      'videos porno',
      'porno amador',
      'videos de corno',
      'sexo amador',
      'porno brasileiro',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'cornos videos'
    ],
    logo: '/imgs/logo-play.png',
    favicon: '/favicon-play.png',
    primaryColor: '#f39c12',
    theme: 'dark',
    canonical: 'https://cornoplay.com',
    ogImage: '/imgs/og-play.jpg',
    siteName: 'CORNO PLAY'
  },
  'cornosbrasil.com': {
    name: 'Cornos Brasil',
    title: 'CORNOS BRASIL - Videos Porno de Sexo Amador | Corno Videos',
    description: 'Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis. CORNOS BRASIL - O melhor site de videos porno amador do Brasil.',
    keywords: [
      'videos porno',
      'porno amador',
      'videos de corno',
      'cornos brasil',
      'sexo amador',
      'videos porno grátis',
      'porno brasileiro',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'cornos videos',
      'porno corno',
      'videos de sexo amador',
      'porno grátis',
      'videos porno brasileiro'
    ],
    logo: '/imgs/logo.png',
    favicon: '/favicon.png',
    primaryColor: '#e74c3c',
    theme: 'dark',
    canonical: 'https://cornosbrasil.com',
    ogImage: '/imgs/logo.png',
    siteName: 'CORNOS BRASIL'
  },
  'cornostv.com': {
    name: 'Cornos TV',
    title: 'CORNOS TV - TV Porno de Cornos Brasileiros',
    description: 'TV porno de cornos brasileiros. Assista ao vivo videos de corno, sexo amador e muito mais. CORNOS TV - A melhor TV porno de corno do Brasil.',
    keywords: [
      'cornos tv',
      'tv porno',
      'videos ao vivo',
      'porno amador',
      'videos de corno',
      'sexo amador',
      'tv brasileira',
      'videos de sexo',
      'amador porno',
      'tv porno amador'
    ],
    logo: '/imgs/logo-tv.png',
    favicon: '/favicon-tv.png',
    primaryColor: '#e67e22',
    theme: 'dark',
    canonical: 'https://cornostv.com',
    ogImage: '/imgs/og-tv.jpg',
    siteName: 'CORNOS TV'
  },
  'cornosvip.com': {
    name: 'Cornos VIP',
    title: 'CORNOS VIP - Conteúdo VIP de Cornos Brasileiros',
    description: 'Conteúdo VIP de cornos brasileiros. Videos exclusivos, sexo amador premium e muito mais. CORNOS VIP - O melhor conteúdo VIP de corno.',
    keywords: [
      'cornos vip',
      'conteúdo vip',
      'videos exclusivos',
      'porno amador',
      'videos de corno',
      'sexo amador',
      'conteúdo premium',
      'videos de sexo',
      'amador porno',
      'videos exclusivos'
    ],
    logo: '/imgs/logo-vip.png',
    favicon: '/favicon-vip.png',
    primaryColor: '#f1c40f',
    theme: 'dark',
    canonical: 'https://cornosvip.com',
    ogImage: '/imgs/og-vip.jpg',
    siteName: 'CORNOS VIP'
  },
  'cornotube.com': {
    name: 'Corno Tube',
    title: 'CORNO TUBE - YouTube de Cornos Brasileiros',
    description: 'YouTube de cornos brasileiros. Videos de corno, sexo amador e muito mais. CORNO TUBE - O melhor YouTube de corno do Brasil.',
    keywords: [
      'corno tube',
      'youtube de corno',
      'videos de corno',
      'porno amador',
      'sexo amador',
      'videos brasileiros',
      'videos de sexo',
      'amador porno',
      'youtube porno',
      'videos porno amador'
    ],
    logo: '/imgs/logo-tube.png',
    favicon: '/favicon-tube.png',
    primaryColor: '#e74c3c',
    theme: 'dark',
    canonical: 'https://cornotube.com',
    ogImage: '/imgs/og-tube.jpg',
    siteName: 'CORNO TUBE'
  },
  'cornovideos.com': {
    name: 'Corno Videos',
    title: 'CORNO VIDEOS - Videos de Cornos Brasileiros',
    description: 'Videos de cornos brasileiros. Sexo amador, videos de traição e muito mais. CORNO VIDEOS - O melhor site de videos de corno.',
    keywords: [
      'corno videos',
      'videos de corno',
      'porno amador',
      'sexo amador',
      'videos brasileiros',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'cornos videos',
      'videos porno'
    ],
    logo: '/imgs/logo-videos.png',
    favicon: '/favicon-videos.png',
    primaryColor: '#2ecc71',
    theme: 'dark',
    canonical: 'https://cornovideos.com',
    ogImage: '/imgs/og-videos.jpg',
    siteName: 'CORNO VIDEOS'
  },
  'esposadecorno.com': {
    name: 'Esposa de Corno',
    title: 'ESPOSA DE CORNO - Videos de Esposas de Cornos',
    description: 'Videos de esposas de cornos. Sexo amador, traição e muito mais. ESPOSA DE CORNO - O melhor site de videos de esposas de corno.',
    keywords: [
      'esposa de corno',
      'videos de esposa',
      'porno amador',
      'sexo amador',
      'traição',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'esposas brasileiras',
      'videos porno'
    ],
    logo: '/imgs/logo-esposa.png',
    favicon: '/favicon-esposa.png',
    primaryColor: '#e91e63',
    theme: 'dark',
    canonical: 'https://esposadecorno.com',
    ogImage: '/imgs/og-esposa.jpg',
    siteName: 'ESPOSA DE CORNO'
  },
  'esposagozando.com': {
    name: 'Esposa Gozando',
    title: 'ESPOSA GOZANDO - Videos de Esposas Gozando',
    description: 'Videos de esposas gozando. Sexo amador, orgasmos reais e muito mais. ESPOSA GOZANDO - O melhor site de videos de esposas gozando.',
    keywords: [
      'esposa gozando',
      'videos de esposa',
      'porno amador',
      'sexo amador',
      'orgasmos',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'esposas brasileiras',
      'videos porno'
    ],
    logo: '/imgs/logo-gozando.png',
    favicon: '/favicon-gozando.png',
    primaryColor: '#ff5722',
    theme: 'dark',
    canonical: 'https://esposagozando.com',
    ogImage: '/imgs/og-gozando.jpg',
    siteName: 'ESPOSA GOZANDO'
  },
  'esposasafada.com': {
    name: 'Esposa Safada',
    title: 'ESPOSA SAFADA - Videos de Esposas Safadas',
    description: 'Videos de esposas safadas. Sexo amador, traição e muito mais. ESPOSA SAFADA - O melhor site de videos de esposas safadas.',
    keywords: [
      'esposa safada',
      'videos de esposa',
      'porno amador',
      'sexo amador',
      'traição',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'esposas brasileiras',
      'videos porno'
    ],
    logo: '/imgs/logo-safada.png',
    favicon: '/favicon-safada.png',
    primaryColor: '#ff9800',
    theme: 'dark',
    canonical: 'https://esposasafada.com',
    ogImage: '/imgs/og-safada.jpg',
    siteName: 'ESPOSA SAFADA'
  },
  'maridocorno.com': {
    name: 'Marido Corno',
    title: 'MARIDO CORNO - Videos de Maridos Cornos',
    description: 'Videos de maridos cornos. Sexo amador, traição e muito mais. MARIDO CORNO - O melhor site de videos de maridos corno.',
    keywords: [
      'marido corno',
      'videos de marido',
      'porno amador',
      'sexo amador',
      'traição',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'maridos brasileiros',
      'videos porno'
    ],
    logo: '/imgs/logo-marido.png',
    favicon: '/favicon-marido.png',
    primaryColor: '#795548',
    theme: 'dark',
    canonical: 'https://maridocorno.com',
    ogImage: '/imgs/og-marido.jpg',
    siteName: 'MARIDO CORNO'
  },
  'mulherdecorno.com': {
    name: 'Mulher de Corno',
    title: 'MULHER DE CORNO - Videos de Mulheres de Cornos',
    description: 'Videos de mulheres de cornos. Sexo amador, traição e muito mais. MULHER DE CORNO - O melhor site de videos de mulheres de corno.',
    keywords: [
      'mulher de corno',
      'videos de mulher',
      'porno amador',
      'sexo amador',
      'traição',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'mulheres brasileiras',
      'videos porno'
    ],
    logo: '/imgs/logo-mulher.png',
    favicon: '/favicon-mulher.png',
    primaryColor: '#9c27b0',
    theme: 'dark',
    canonical: 'https://mulherdecorno.com',
    ogImage: '/imgs/og-mulher.jpg',
    siteName: 'MULHER DE CORNO'
  },
  'mulherdocorno.com': {
    name: 'Mulher do Corno',
    title: 'MULHER DO CORNO - Videos de Mulheres de Cornos',
    description: 'Videos de mulheres de cornos. Sexo amador, traição e muito mais. MULHER DO CORNO - O melhor site de videos de mulheres de corno.',
    keywords: [
      'mulher do corno',
      'videos de mulher',
      'porno amador',
      'sexo amador',
      'traição',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'mulheres brasileiras',
      'videos porno'
    ],
    logo: '/imgs/logo-mulher.png',
    favicon: '/favicon-mulher.png',
    primaryColor: '#9c27b0',
    theme: 'dark',
    canonical: 'https://mulherdocorno.com',
    ogImage: '/imgs/og-mulher.jpg',
    siteName: 'MULHER DO CORNO'
  },
  'videosdecorno.com': {
    name: 'Videos de Corno',
    title: 'VIDEOS DE CORNO - Videos de Cornos Brasileiros',
    description: 'Videos de cornos brasileiros. Sexo amador, videos de traição e muito mais. VIDEOS DE CORNO - O melhor site de videos de corno.',
    keywords: [
      'videos de corno',
      'porno amador',
      'sexo amador',
      'videos brasileiros',
      'videos de sexo',
      'amador porno',
      'videos porno amador',
      'cornos videos',
      'videos porno',
      'porno brasileiro'
    ],
    logo: '/imgs/logo-videos.png',
    favicon: '/favicon-videos.png',
    primaryColor: '#2196f3',
    theme: 'dark',
    canonical: 'https://videosdecorno.com',
    ogImage: '/imgs/og-videos.jpg',
    siteName: 'VIDEOS DE CORNO'
  }
}

export function getDomainConfig(hostname: string): DomainConfig {
  // Remove port and protocol
  const domain = hostname.replace(/:\d+$/, '').toLowerCase()
  
  // Check if we have a config for this domain
  if (domainConfigs[domain]) {
    return domainConfigs[domain]
  }
  
  // Default fallback to cornosbrasil.com
  return domainConfigs['cornosbrasil.com']
}

export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname.replace(/:\d+$/, '').toLowerCase()
  }
  return 'cornosbrasil.com'
}
