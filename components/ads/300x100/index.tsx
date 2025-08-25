'use client'

import { useEffect, useState } from 'react';
import AdIcon from '../AdIcon';

const AdIframe300x100 = () => {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [iframeId, setIframeId] = useState<string>('ae313996'); // Valor padrão
  const [iframeName, setIframeName] = useState<string>('ae313996'); // Valor padrão
  const [iframeZoneId, setIframeZoneId] = useState<string>('2'); // Valor padrão

  // Mapeamento de domínios para id, name e zoneid
  const domainConfig: Record<string, { id: string; name: string; zoneid: string }> = {
    'cornofilmando.com': { id: 'ae67cb37', name: 'ae67cb37', zoneid: '5' },
    'cornomanso.com.br': { id: 'adb32b21', name: 'adb32b21', zoneid: '8' },
    'cornoplay.com': { id: 'a472e6c4', name: 'a472e6c4', zoneid: '11' },
    'cornosbrasil.com': { id: 'ae313996', name: 'ae313996', zoneid: '2' },
    'cornostv.com': { id: 'a8119852', name: 'a8119852', zoneid: '14' },
    'cornosvip.com': { id: 'acfe4b83', name: 'acfe4b83', zoneid: '17' },
    'cornotube.com': { id: 'a74bfac6', name: 'a74bfac6', zoneid: '20' },
    'cornovideos.com': { id: 'a2d1cd3b', name: 'a2d1cd3b', zoneid: '23' },
    'esposadecorno.com': { id: 'a51d11d5', name: 'a51d11d5', zoneid: '26' },
    'esposagozando.com': { id: 'ab823de7', name: 'ab823de7', zoneid: '29' },
    'esposasafada.com': { id: 'a574f2f3', name: 'a574f2f3', zoneid: '32' },
    'maridocorno.com': { id: 'a4ec85e0', name: 'a4ec85e0', zoneid: '35' },
    'mulherdecorno.com': { id: 'a9bf1d70', name: 'a9bf1d70', zoneid: '37' },
    'mulherdocorno.com': { id: 'ad719b48', name: 'ad719b48', zoneid: '41' },
    'videosdecorno.com': { id: 'a01f49ea', name: 'a01f49ea', zoneid: '44' },
  };

  // Gerar número aleatório e configurar id, name e zoneid com base no domínio
  useEffect(() => {
    // Gerar número aleatório
    setRandomNumber(Math.floor(Math.random() * 1000000000));

    // Obter o domínio atual
    const hostname = window.location.hostname;

    // Procurar configuração correspondente ao domínio
    let newId = 'ae313996'; // Valor padrão
    let newName = 'ae313996'; // Valor padrão
    let newZoneId = '2'; // Valor padrão

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
        height="100"
        allow="autoplay"
      >
        <a href={linkHref} target="_blank" rel="noopener noreferrer">
          <img src={imgSrc} alt="" />
        </a>
      </iframe>
    </div>
  );
};

export default AdIframe300x100;