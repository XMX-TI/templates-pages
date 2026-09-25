# templates-pages

Catálogo interno de modelos de página de **upsell** em HTML estático, consolidados de vários produtos da empresa. Cada pasta em [templates-upsells/](templates-upsells/) é uma página completa e autocontida (`index.html` + `assets/`), pronta para ser copiada para o repositório do produto e adaptada. O objetivo do repositório é ser um índice de **estruturas de página** — não um repositório de campanhas: o que interessa aqui é a mecânica e a sequência de seções, não a copy nem as cores de um produto específico.

## Templates

| Preview | Template | Ofertas | Vídeo |
| --- | --- | --- | --- |
| <a href="templates-upsells/upsell-vsl-12-v1/preview.png"><img src="templates-upsells/upsell-vsl-12-v1/preview.png" width="180" alt="preview do upsell-vsl-12-v1"></a> | [upsell-vsl-12-v1](templates-upsells/upsell-vsl-12-v1/) | 1 oferta + order bump | Sim |
| <a href="templates-upsells/upsell-vsl-263-v2/preview.png"><img src="templates-upsells/upsell-vsl-263-v2/preview.png" width="180" alt="preview do upsell-vsl-263-v2"></a> | [upsell-vsl-263-v2](templates-upsells/upsell-vsl-263-v2/) | 3 kits | Sim |
| <a href="templates-upsells/upsell-vsl-263-v3/preview.png"><img src="templates-upsells/upsell-vsl-263-v3/preview.png" width="180" alt="preview do upsell-vsl-263-v3"></a> | [upsell-vsl-263-v3](templates-upsells/upsell-vsl-263-v3/) | 3 kits | Sim |
| <a href="templates-upsells/upsell-vsl-396-v1/preview.png"><img src="templates-upsells/upsell-vsl-396-v1/preview.png" width="180" alt="preview do upsell-vsl-396-v1"></a> | [upsell-vsl-396-v1](templates-upsells/upsell-vsl-396-v1/) | 3 kits | Sim |

Os templates compartilham a mesma base técnica: player VTurb/ConverteAI e liberação da oferta só depois de N segundos de vídeo (`data-delay`). Os três primeiros também trazem a integração de one-click upsell da CartPanda; o `upsell-vsl-263-v3` já entrou sem ela, com os links de compra trocados por `linkoffer1`–`linkoffer3`.

## Como usar

1. Copie a pasta do template inteira (`index.html` + `assets/`) para o repositório do produto.
2. Substitua os placeholders e todo o conteúdo específico de produto: links de checkout e de recusa, textos, imagens, preços, nome do produto, IDs de player e de analytics.
3. Antes de publicar, **verifique que não restou nenhum `{{`** no HTML — e, enquanto os templates deste catálogo ainda não estiverem totalmente parametrizados, confira também que não sobrou nenhum `linkoffer` / `linkno` nem nenhum valor herdado de outro produto.

## Placeholders

Nenhum placeholder no padrão `{{NOME}}` foi encontrado nos arquivos deste repositório — os templates ainda carregam valores literais herdados dos produtos de origem. As únicas marcações de substituição realmente presentes hoje são convenções de link:

| Marcação | Onde aparece | O que significa |
| --- | --- | --- |
| `linkoffer` | convenção do catálogo | Destino de aceite da oferta — o link de checkout / próxima etapa do funil. Deve ser trocado pelo link real do produto. |
| `linkno` | `upsell-vsl-263-v2/index.html` (com `TODO` no código) | Destino de recusa — downsell ou próxima etapa do funil quando o usuário clica em "no thanks". |
| `modaloffer-yes` / `modaloffer-no` | `upsell-vsl-396-v1/index.html` (bloco comentado do modal de downsell) | Aceite e recusa da oferta exibida no modal. |

Ao parametrizar um template novo, prefira o padrão `{{NOME}}` e registre aqui cada placeholder introduzido.

## Como contribuir

- **Template novo só entra se for estruturalmente diferente** dos que já existem. Variação de cor, de copy, de imagem ou de preço não conta como template novo — nesse caso, adapte um dos existentes no repositório do produto.
- **Toda página adicionada precisa estar sanitizada**, sem exceção:
  - sem ID de pixel ou de analytics real (Clarity, GTM, Meta, Google Ads);
  - sem link de checkout de produção — use `linkoffer` para aceite e `linkno` para recusa;
  - sem preço ou nome de produto real;
  - sem chave de API, token ou ID de conta (inclusive IDs de player/conta VTurb/ConverteAI);
  - sem scripts de plataforma de pagamento no `<head>` (BuyGoods, CartPanda, PageAmerican) — eles pertencem ao repositório do produto, não ao template.
- Inclua um `preview.png` na pasta e um `README.md` próprio descrevendo a mecânica e os placeholders da página.

## Pendências

Levantadas na consolidação deste catálogo, em ordem de prioridade:

- **Nenhum template está sanitizado.** Os três primeiros `index.html` contêm nome de produto real, preços reais, links de checkout/OCU de produção da CartPanda, IDs de conta e de player VTurb/ConverteAI e ID de projeto do Microsoft Clarity. O `upsell-vsl-263-v3` já não tem checkout nem analytics, mas ainda carrega preços reais, IDs de conta e de player VTurb/ConverteAI e imagens com o nome do produto. Precisam ser limpos antes de o catálogo ser usado como referência pública interna.
- **Nenhum template usa placeholders `{{NOME}}`.** A parametrização ainda precisa ser feita em todos.
- **`upsell-vsl-12-v1` referencia uma fonte que não existe** (`assets/fonts/montserrat-latin-var.woff2`) — o texto cai no fallback do sistema.
- **`upsell-vsl-12-v1`, `upsell-vsl-396-v1` e `upsell-vsl-263-v3` não têm `README.md` próprio.**
- **`upsell-vsl-263-v2/README.md` não descreve o template**: é o README de outro projeto (Memyts), sobre estrutura de branches, que veio junto na consolidação e deve ser reescrito.
- **`upsell-vsl-263-v2` carrega ferramental de build residual** (`gulpfile.js`, `package.json`, `package-lock.json`, `assets/css/scss/` duplicado com `assets/css/`), o que não faz sentido para um template estático de catálogo.
- **`upsell-vsl-396-v1` tem um bloco grande de HTML comentado** (modal de "3 portas" com revelação de desconto e um downsell completo). Ou vira um template próprio, ou deve ser removido.
- **`upsell-vsl-263-v3` não tem link de recusa ativo**: o `linkno` está comentado, então a página termina nos kits sem saída de "no thanks". Também tem um popup comentado (revelação de desconto + downsell) e fontes SCSS residuais (`assets/css/style.scss`, `style.css.map`).
- **`upsell-vsl-263-v3` precisa confirmar que é estruturalmente diferente do `upsell-vsl-263-v2`**: os dois são VSL + 3 kits. Se a diferença for só visual, um dos dois deve sair do catálogo.
