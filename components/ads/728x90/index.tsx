'use client'

import AdIcon from '../AdIcon';
import { useEffect, useState } from 'react';

const AdIframe728x90 = () => {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [iframeId, setIframeId] = useState<string>('abc641d8'); // Valor padrão
  const [iframeName, setIframeName] = useState<string>('abc641d8'); // Valor padrão
  const [iframeZoneId, setIframeZoneId] = useState<string>('3'); // Valor padrão

  // Mapeamento de domínios para id, name e zoneid
  const domainConfig: Record<string, { id: string; name: string; zoneid: string }> = {
    'cornofilmando.com': { id: 'a0aa3da7', name: 'a0aa3da7', zoneid: '6' },
    'cornomanso.com.br': { id: 'a99d2114', name: 'a99d2114', zoneid: '9' },
    'cornoplay.com': { id: 'a1605af0', name: 'a1605af0', zoneid: '12' },
    'cornosbrasil.com': { id: 'abc641d8', name: 'abc641d8', zoneid: '3' },
    'cornostv.com': { id: 'a39a4d4b', name: 'a39a4d4b', zoneid: '15' },
    'cornosvip.com': { id: 'a5425873', name: 'a5425873', zoneid: '18' },
    'cornotube.com': { id: 'ada29fa5', name: 'ada29fa5', zoneid: '21' },
    'cornovideos.com': { id: 'a6f863b9', name: 'a6f863b9', zoneid: '24' },
    'esposadecorno.com': { id: 'abb4c25f', name: 'abb4c25f', zoneid: '27' },
    'esposagozando.com': { id: 'a20d42f0', name: 'a20d42f0', zoneid: '30' },
    'esposasafada.com': { id: 'afa60411', name: 'afa60411', zoneid: '33' },
    'maridocorno.com': { id: 'a9b056b9', name: 'a9b056b9', zoneid: '36' },
    'mulherdecorno.com': { id: 'a3b81dfa', name: 'a3b81dfa', zoneid: '39' },
    'mulherdocorno.com': { id: 'a426c20b', name: 'a426c20b', zoneid: '42' },
    'videosdecorno.com': { id: 'abb51ca1', name: 'abb51ca1', zoneid: '45' },
  };

  // Gerar número aleatório e configurar id, name e zoneid com base no domínio
  useEffect(() => {
    // Gerar número aleatório
    setRandomNumber(Math.floor(Math.random() * 1000000000));

    // Obter o domínio atual
    const hostname = window.location.hostname;

    // Procurar configuração correspondente ao domínio
    let newId = 'a16d5d84'; // Valor padrão
    let newName = 'a16d5d84'; // Valor padrão
    let newZoneId = '1'; // Valor padrão

    // Verificar se o domínio ou subdomínio está no mapeamento
    const matchedDomain = Object.keys(domainConfig).find((domain) =>
      hostname.includes(domain)
    );

    if (matchedDomain) {
      newId = domainConfig[matchedDomain].id;
      newName = domainConfig[matchedDomain].name;
      newZoneId = domainConfig[matchedDomain].zoneid;
    }

    setIframeId(newId);
    setIframeName(newName);
    setIframeZoneId(newZoneId);
  }, []);

  // Evitar renderização antes de randomNumber estar pronto
  if (!randomNumber) return null;

  // URLs com o número aleatório e zoneid dinâmico
  const iframeSrc = `https://cbrservicosdigitais.com.br/manager/www/delivery/afr.php?zoneid=${iframeZoneId}&target=_blank&cb=${randomNumber}`;
  const linkHref = `https://cbrservicosdigitais.com.br/manager/www/delivery/ck.php?n=a62b70fe&cb=${randomNumber}`;
  const imgSrc = `https://cbrservicosdigitais.com.br/manager/www/delivery/avw.php?zoneid=${iframeZoneId}&cb=${randomNumber}&n=a62b70fe`;

  return (
    <div className="relative">
      <AdIcon />
      <iframe
        id={iframeId}
        name={iframeName}
        src={iframeSrc}
        frameBorder="0"
        scrolling="no"
        width="728"
        height="90"
        allow="autoplay"
      >
        <a href={linkHref} target="_blank" rel="noopener noreferrer">
          <img src={imgSrc} alt="" />
        </a>
      </iframe>
    </div>
  );
};

export default AdIframe728x90;