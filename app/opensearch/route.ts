import { NextResponse } from 'next/server';

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>CORNOS BRASIL</ShortName>
  <Description>Pesquise videos porno amador brasileiro no CORNOS BRASIL</Description>
  <Tags>videos porno, porno amador, videos de corno, sexo amador</Tags>
  <Contact>admin@cornosbrasil.com</Contact>
  <Url type="application/opensearchdescription+xml" rel="self" template="https://cornosbrasil.com/opensearch.xml"/>
  <Url type="text/html" rel="results" template="https://cornosbrasil.com/search?q={searchTerms}"/>
  <Url type="application/x-suggestions+json" rel="suggestions" template="https://cornosbrasil.com/api/search/suggest?q={searchTerms}"/>
  <LongName>CORNOS BRASIL - Videos Porno de Sexo Amador</LongName>
  <Image height="16" width="16" type="image/x-icon">https://cornosbrasil.com/favicon.ico</Image>
  <Image height="64" width="64" type="image/png">https://cornosbrasil.com/imgs/logo.png</Image>
  <Query role="example" searchTerms="videos porno amador"/>
  <Developer>CORNOS BRASIL</Developer>
  <Attribution>Copyright 2024 CORNOS BRASIL</Attribution>
  <SyndicationRight>open</SyndicationRight>
  <AdultContent>true</AdultContent>
  <Language>pt-BR</Language>
  <OutputEncoding>UTF-8</OutputEncoding>
  <InputEncoding>UTF-8</InputEncoding>
</OpenSearchDescription>`;

  return new NextResponse(xml, {
    headers: { 
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    },
  });
}
