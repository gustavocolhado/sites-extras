'use client'

import { useEffect, useState } from 'react';
import AdIcon from '../AdIcon';

const AdIframe300x250 = () => {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [iframeId, setIframeId] = useState<string>('ac3bc336'); // Valor padrão
  const [iframeName, setIframeName] = useState<string>('ac3bc336'); // Valor padrão
  const [iframeZoneId, setIframeZoneId] = useState<string>('1'); // Valor padrão

  // Mapeamento de domínios para id, name e zoneid
  const domainConfig: Record<string, { id: string; name: string; zoneid: string }> = {
    'cornofilmando.com': { id: 'a4942c79', name: 'a4942c79', zoneid: '4' },
    'cornomanso.com.br': { id: 'ad821a11', name: 'ad821a11', zoneid: '7' },
    'cornoplay.com': { id: 'a78040f8', name: 'a78040f8', zoneid: '10' },
    'cornosbrasil.com': { id: 'a16d5d84', name: 'a16d5d84', zoneid: '1' },
    'cornostv.com': { id: 'ac9facd9', name: 'ac9facd9', zoneid: '13' },
    'cornosvip.com': { id: 'a8db843b', name: 'a8db843b', zoneid: '16' },
    'cornotube.com': { id: 'a2c3465f', name: 'a2c3465f', zoneid: '19' },
    'cornovideos.com': { id: 'a7a388e8', name: 'a7a388e8', zoneid: '22' },
    'esposadecorno.com': { id: 'a21aebc2', name: 'a21aebc2', zoneid: '25' },
    'esposagozando.com': { id: 'a9cb8b2c', name: 'a9cb8b2c', zoneid: '28' },
    'esposasafada.com': { id: 'a2e8c3cf', name: 'a2e8c3cf', zoneid: '31' },
    'maridocorno.com': { id: 'afeaf10f', name: 'afeaf10f', zoneid: '34' },
    'mulherdecorno.com': { id: 'a2bbdf3d', name: 'a2bbdf3d', zoneid: '38' },
    'mulherdocorno.com': { id: 'a28a4525', name: 'a28a4525', zoneid: '40' },
    'videosdecorno.com': { id: 'a0597e1f', name: 'a0597e1f', zoneid: '43' },
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
        width="300"
        height="250"
        allow="autoplay"
      >
        <a href={linkHref} target="_blank" rel="noopener noreferrer">
          <img src={imgSrc} alt="" />
        </a>
      </iframe>
    </div>
  );
};

export default AdIframe300x250;