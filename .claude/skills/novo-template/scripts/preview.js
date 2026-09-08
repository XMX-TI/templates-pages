#!/usr/bin/env node
/**
 * Gera preview.png (full page, 1280px) de cada template em templates-upsells/.
 *
 * Uso:
 *   NODE_PATH=<dir>/node_modules node .claude/skills/novo-template/scripts/preview.js [pasta...] [--force]
 *
 * Sem pastas nomeadas, varre todas. Pula quem já tem preview.png (salvo --force).
 * Não escreve em nenhum arquivo do template além do próprio preview.png.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const ROOT = path.join(REPO, 'templates-upsells');

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

(async () => {
  if (!fs.existsSync(ROOT)) {
    console.error('Nao encontrei ' + ROOT);
    process.exit(1);
  }

  const dirs = fs
    .readdirSync(ROOT)
    .filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory())
    .filter((d) => only.length === 0 || only.includes(d));

  if (dirs.length === 0) {
    console.error('Nenhuma pasta de template correspondente.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const report = [];

  for (const dir of dirs) {
    const folder = path.join(ROOT, dir);
    const index = path.join(folder, 'index.html');
    const out = path.join(folder, 'preview.png');

    if (fs.existsSync(out) && !force) {
      report.push({ dir, status: 'skip (ja tem preview.png; use --force)' });
      continue;
    }
    if (!fs.existsSync(index)) {
      report.push({ dir, status: 'FALHOU: sem index.html' });
      continue;
    }

    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const failed = [];
    const hosts = new Set();
    page.on('requestfailed', (r) => failed.push(r.url()));
    page.on('request', (r) => {
      const u = r.url();
      if (/^https?:/.test(u)) {
        try {
          hosts.add(new URL(u).host);
        } catch (e) {
          /* url exotica; ignora */
        }
      }
    });

    try {
      await page.goto('file:///' + index.split(path.sep).join('/'), {
        waitUntil: 'load',
        timeout: 45000,
      });
      try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
      } catch (e) {
        /* players externos podem nunca aquietar; segue */
      }

      // Revela os blocos de oferta apagando a regra "[data-delay]{display:none}"
      // das folhas de estilo, para que o display natural de cada secao valha.
      const revealed = await page.evaluate(() => {
        let rulesRemoved = 0;
        for (const sheet of Array.from(document.styleSheets)) {
          let rules;
          try {
            rules = sheet.cssRules;
          } catch (e) {
            continue; // folha cross-origin
          }
          if (!rules) continue;
          for (let i = rules.length - 1; i >= 0; i--) {
            const r = rules[i];
            if (
              r.selectorText &&
              r.selectorText.includes('[data-delay]') &&
              /display\s*:\s*none/i.test(r.cssText)
            ) {
              sheet.deleteRule(i);
              rulesRemoved++;
            }
          }
        }
        // rede de seguranca: bloco ainda invisivel ganha display explicito
        let forcedVisible = 0;
        for (const el of document.querySelectorAll('[data-delay]')) {
          if (getComputedStyle(el).display === 'none') {
            el.style.display = 'block';
            forcedVisible++;
          }
        }
        return { rulesRemoved, forcedVisible };
      });

      await page.waitForTimeout(2500);

      const dims = await page.evaluate(() => {
        const blocks = Array.from(document.querySelectorAll('[data-delay]'));
        return {
          height: document.documentElement.scrollHeight,
          delayBlocks: blocks.length,
          stillHidden: blocks.filter(
            (el) => getComputedStyle(el).display === 'none',
          ).length,
        };
      });

      await page.screenshot({ path: out, fullPage: true });

      const localFailed = failed.filter((u) => u.startsWith('file:'));
      report.push({
        dir,
        status: 'ok',
        ...dims,
        ...revealed,
        bytes: fs.statSync(out).size,
        requestsFailed: failed.length,
        localAssetsMissing: localFailed,
        externalHosts: Array.from(hosts).sort(),
      });
    } catch (e) {
      report.push({
        dir,
        status: 'FALHOU: ' + e.message.split('\n')[0],
        requestsFailed: failed.length,
        sampleFailed: failed.slice(0, 3),
      });
    }

    await ctx.close();
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));

  const broke = report.filter((r) => r.status.startsWith('FALHOU'));
  if (broke.length) process.exitCode = 1;
})();
