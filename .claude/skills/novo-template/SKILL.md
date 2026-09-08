---
name: novo-template
description: Valida e publica um template novo no catálogo templates-upsells/. Use quando alguém adicionar uma pasta de template nova, ou pedir para "checar o template", "ver se sobrou checkout", "gerar o preview", "atualizar o README com o template novo". Faz três coisas - varre resíduos de plataforma de pagamento (BuyGoods, CartPanda, PageAmerican) e outros dados de produção, gera o preview.png full page com Playwright, e adiciona a linha do template na tabela do README seguindo o padrão existente.
---

# Novo template no catálogo

Fluxo para entrar com um template novo em [templates-upsells/](../../../templates-upsells/). São três etapas — sanitização, preview, README — e a **etapa 1 é bloqueante**: não gere preview nem mexa no README de um template que ainda tem dado de produção.

Descubra os alvos com `git status --porcelain` (pastas novas) ou use o que o usuário nomeou. Se ele não disse qual, rode nas pastas de `templates-upsells/` que ainda não têm `preview.png`.

## Etapa 1 — Sanitização (bloqueante)

O catálogo é um índice de **estruturas de página**, não de campanhas. Nenhum dado de produção pode entrar.

Rode a varredura na pasta do template:

```bash
grep -rniE "buygoods|cartpanda|mycartpanda|pageamerican|pagamerican" templates-upsells/<pasta>/
```

Esses três são os bloqueadores que o time mais esquece — scripts de checkout no `<head>`, links de OCU (one-click upsell) e domínios de asset. Eles pertencem ao repositório do produto, não ao template.

Vale também procurar o resto do que o README lista como obrigatório:

```bash
grep -rniE "clarity|gtm-|googletagmanager|fbq|gtag|converteai|vturb|scripts\.converteai\.net" templates-upsells/<pasta>/
grep -rnE "https?://[^\"' ]*(checkout|secure|pay|order)" templates-upsells/<pasta>/
grep -rnE "\\$[0-9]" templates-upsells/<pasta>/index.html
```

Ao reportar, **cite arquivo e linha de cada ocorrência** e diga o que é (script de checkout, ID de player, preço real…). Não conserte por conta própria: quem adicionou o template decide se troca por `linkoffer`/`linkno`, por `{{NOME}}` ou se remove. Pergunte antes de editar qualquer `index.html`.

Se a varredura vier limpa, siga para a etapa 2. Se não, mostre os achados e pare — só continue se o usuário mandar seguir mesmo assim.

**O grep sozinho não fecha a conta.** Parte das chamadas de produção não está no código — é injetada em runtime pelo player. Nos templates atuais, `assets.mycartpanda.com` é carregado sem que a string "cartpanda" apareça em nenhum arquivo. Por isso o script da etapa 2 devolve `externalHosts`, a lista de domínios que a página realmente contatou ao renderizar. Revise essa lista depois de gerar o preview: hosts de checkout, analytics (`*.clarity.ms`, `googletagmanager`) ou rede de afiliado (`go.maxweb.com`) são achados da etapa 1 mesmo aparecendo só ali. `converteai.net`, `vturb.com`, `b-cdn.net` e `fonts.g*` são o player e as fontes — esperados.

## Etapa 2 — Preview

Use [scripts/preview.js](scripts/preview.js), que já resolve os detalhes que quebram esse print:

- viewport de 1280px, screenshot **full page**, aberto por `file://` com caminho absoluto;
- pula pasta que já tem `preview.png` (passe `--force` para regravar);
- **revela os blocos de oferta**: apaga em runtime a regra `[data-delay] { display: none }` das folhas de estilo. Sem isso o preview mostra só o topo da página, porque a oferta (card de produto, kits, timer, order bump, link de recusa) só é liberada depois de N segundos de vídeo. Apagar a regra — em vez de forçar `display: block` — preserva o layout que o CSS do template já define, então as grades de 3 kits saem alinhadas e não empilhadas;
- nunca escreve em `index.html`, CSS ou qualquer outro arquivo do template. Só cria `preview.png`.

Playwright não é dependência deste projeto e **não deve virar uma**. Instale num diretório temporário fora do repositório:

```bash
PWDIR="${TMPDIR:-/tmp}/pw-preview"
mkdir -p "$PWDIR" && cd "$PWDIR" && npm init -y >/dev/null && npm i playwright && npx playwright install chromium
```

Depois rode o script apontando o `NODE_PATH` para lá:

```bash
NODE_PATH="$PWDIR/node_modules" node .claude/skills/novo-template/scripts/preview.js
```

Sem argumentos ele varre todas as pastas de `templates-upsells/`; passe nomes de pasta para limitar (`… preview.js upsell-vsl-500-v1`).

Depois de gerar, **abra cada PNG com a ferramenta Read e olhe**. O script reporta altura, quantos blocos `[data-delay]` continuaram ocultos, os hosts externos contatados e quantas requisições falharam, mas só o olho pega layout quebrado. Confira que:

- a página inteira aparece, do topo ao link de recusa;
- a oferta está visível (`stillHidden: 0` no relatório);
- nada essencial saiu em branco.

Requisições externas falhando são esperadas fora de produção — `assets.mycartpanda.com`, `license.vturb.com`, `vt-h-1.b-cdn.net`. O player VTurb ainda renderiza o pôster, então o preview sai utilizável. Já um asset **local** faltando (fonte, imagem) é problema real do template: reporte com o caminho.

Se um template falhar ou sair visivelmente vazio, não force — reporte qual falhou e o motivo aparente.

## Etapa 3 — README

Adicione a linha na tabela de [README.md](../../../README.md), seguindo exatamente o padrão existente. As colunas são `Preview | Template | Ofertas | Vídeo` e a descrição é deliberadamente enxuta: **quantidade de ofertas e se tem vídeo, nada de sequência de seções**.

```
| <a href="templates-upsells/<pasta>/preview.png"><img src="templates-upsells/<pasta>/preview.png" width="180" alt="preview do <pasta>"></a> | [<pasta>](templates-upsells/<pasta>/) | <ofertas> | Sim |
```

O `<img width="180">` em HTML é proposital: Markdown puro não redimensiona, e as alturas dos previews variam muito entre templates.

Em "Ofertas", conte quantas ofertas de compra a página apresenta — `1 oferta + order bump`, `3 kits`. Em "Vídeo", `Sim`/`Não`.

Antes de terminar:

- se descobriu algo estrutural na varredura ou no preview (asset local faltando, README próprio ausente, ferramental de build residual), acrescente em **Pendências**;
- remova de Pendências o que o trabalho resolveu;
- confirme com `git status --porcelain` que só mudaram o `README.md` e os `preview.png` esperados.

Ofereça o commit no padrão do repositório (Conventional Commits, em português) — mas não commite sem o usuário confirmar.
