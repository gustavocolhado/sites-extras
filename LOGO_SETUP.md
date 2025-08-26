# 🎨 Configuração de Logos por Domínio

## 📋 Logos Necessárias

Cada domínio precisa de sua própria logo na pasta `public/imgs/`. Aqui está a lista completa:

### ✅ Logo Base (já existe)
- `logo.png` - Cornos Brasil (logo principal)

### 🔄 Logos que precisam ser criadas

Copie o `logo.png` para cada um dos seguintes arquivos e edite o texto para refletir o nome do domínio:

1. **`logo-filmando.png`** → CORNO FILMANDO
   - Domínio: cornofilmando.com
   - Cor primária: #3498db (azul)

3. **`logo-manso.png`** → CORNO MANSO
   - Domínio: cornomanso.com.br
   - Cor primária: #9b59b6 (roxo)

4. **`logo-play.png`** → CORNO PLAY
   - Domínio: cornoplay.com
   - Cor primária: #f39c12 (laranja)

5. **`logo-tv.png`** → CORNOS TV
   - Domínio: cornostv.com
   - Cor primária: #e67e22 (laranja escuro)

6. **`logo-vip.png`** → CORNOS VIP
   - Domínio: cornosvip.com
   - Cor primária: #f1c40f (amarelo)

7. **`logo-tube.png`** → CORNO TUBE
   - Domínio: cornotube.com
   - Cor primária: #e74c3c (vermelho)

8. **`logo-videos.png`** → CORNO VIDEOS
   - Domínio: cornovideos.com
   - Cor primária: #2ecc71 (verde)

9. **`logo-esposa.png`** → ESPOSA DE CORNO
   - Domínio: esposadecorno.com
   - Cor primária: #e91e63 (rosa)

10. **`logo-gozando.png`** → ESPOSA GOZANDO
    - Domínio: esposagozando.com
    - Cor primária: #ff5722 (laranja vermelho)

11. **`logo-safada.png`** → ESPOSA SAFADA
    - Domínio: esposasafada.com
    - Cor primária: #ff9800 (laranja)

12. **`logo-marido.png`** → MARIDO CORNO
    - Domínio: maridocorno.com
    - Cor primária: #795548 (marrom)

13. **`logo-mulher.png`** → MULHER DE CORNO / MULHER DO CORNO
    - Domínios: mulherdecorno.com, mulherdocorno.com
    - Cor primária: #9c27b0 (roxo)

14. **`logo-videos.png`** → VIDEOS DE CORNO (mesmo arquivo do cornovideos.com)
    - Domínio: videosdecorno.com
    - Cor primária: #2196f3 (azul)

## 🛠️ Como Criar as Logos

### Opção 1: Copiar e Editar Manualmente
```bash
# No PowerShell, na pasta do projeto:
cd public/imgs

# Copiar o logo base para cada domínio
Copy-Item "logo.png" "logo-filmando.png"
Copy-Item "logo.png" "logo-manso.png"
Copy-Item "logo.png" "logo-play.png"
Copy-Item "logo.png" "logo-tv.png"
Copy-Item "logo.png" "logo-vip.png"
Copy-Item "logo.png" "logo-tube.png"
Copy-Item "logo.png" "logo-videos.png"
Copy-Item "logo.png" "logo-esposa.png"
Copy-Item "logo.png" "logo-gozando.png"
Copy-Item "logo.png" "logo-safada.png"
Copy-Item "logo.png" "logo-marido.png"
Copy-Item "logo.png" "logo-mulher.png"
```

### Opção 2: Usar o Script
```bash
node scripts/generate-logos.js
```

## 🎨 Dicas para Edição

1. **Mantenha o mesmo tamanho** - Use as mesmas dimensões do logo original
2. **Formato PNG** - Mantenha a transparência se houver
3. **Cores** - Use as cores primárias de cada domínio (listadas acima)
4. **Texto** - Altere apenas o texto, mantenha o estilo visual
5. **Qualidade** - Mantenha a mesma qualidade/resolução

## 🔍 Como Testar

1. **Desenvolvimento local:**
   ```bash
   npm run dev
   ```

2. **Testar domínios:**
   - Adicione entradas no arquivo hosts para simular diferentes domínios
   - Ou use ferramentas como ngrok para testar com domínios reais

3. **Verificar se as logos aparecem:**
   - Acesse cada domínio
   - Verifique se a logo correta aparece no header
   - Confirme se o favicon também está correto

## 📁 Estrutura Final

```
public/imgs/
├── logo.png (CORNOS BRASIL - já existe)
├── logo-filmando.png (CORNO FILMANDO)
├── logo-manso.png (CORNO MANSO)
├── logo-play.png (CORNO PLAY)
├── logo-tv.png (CORNOS TV)
├── logo-vip.png (CORNOS VIP)
├── logo-tube.png (CORNO TUBE)
├── logo-videos.png (CORNO VIDEOS)
├── logo-esposa.png (ESPOSA DE CORNO)
├── logo-gozando.png (ESPOSA GOZANDO)
├── logo-safada.png (ESPOSA SAFADA)
├── logo-marido.png (MARIDO CORNO)
└── logo-mulher.png (MULHER DE CORNO)
```

## ⚠️ Importante

- **Favicons**: Também precisam ser criados para cada domínio
- **Open Graph Images**: Imagens para redes sociais também devem ser personalizadas
- **Teste**: Sempre teste após criar cada logo para garantir que está funcionando
