/**
 * Builds the Manja token artifacts.
 *
 * Style Dictionary resolves and transforms the token graph; this script owns the
 * final file assembly so that theme selectors and the `prefers-color-scheme`
 * block are written exactly as the design system contract specifies.
 *
 * Outputs:
 *   dist/css/tokens.css     every token, all themes, one stylesheet
 *   dist/css/tokens.light.css / tokens.dark.css   single-theme stylesheets
 *   dist/tokens.json        resolved light values (nested)
 *   dist/tokens.dark.json   resolved dark values (nested)
 *   src/generated/tokens.ts typed token objects, compiled by tsc afterwards
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, 'src');
const DIST = path.join(here, 'dist');
const STAGE = path.join(here, '.tmp');
const GENERATED = path.join(SRC, 'generated');

const PREFIX = 'mj';
const THEME_ATTR = 'data-mj-theme';
const THEMES = ['light', 'dark'];

const isSemantic = (token) => token.filePath.includes(`${path.sep}semantic${path.sep}`);

/* ------------------------------------------------------------------ *
 * Theme parity check
 *
 * Every semantic token must exist in every theme. A token present in light
 * but missing from dark produces a variable that silently keeps its light
 * value when the theme flips — the single most common design-system bug,
 * and invisible until someone looks at the wrong screen.
 * ------------------------------------------------------------------ */
function flattenKeys(node, trail = [], out = []) {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object' && !('value' in value)) {
      flattenKeys(value, [...trail, key], out);
    } else {
      out.push([...trail, key].join('.'));
    }
  }
  return out;
}

async function assertThemeParity() {
  const sets = await Promise.all(
    THEMES.map(async (theme) => {
      const raw = await readFile(path.join(SRC, 'semantic', `${theme}.json`), 'utf8');
      return new Set(flattenKeys(JSON.parse(raw)));
    }),
  );

  const [light, dark] = sets;
  const missingInDark = [...light].filter((key) => !dark.has(key));
  const missingInLight = [...dark].filter((key) => !light.has(key));

  if (missingInDark.length || missingInLight.length) {
    const details = [
      ...missingInDark.map((key) => `  missing from dark.json:  ${key}`),
      ...missingInLight.map((key) => `  missing from light.json: ${key}`),
    ].join('\n');
    throw new Error(`Semantic themes are out of sync.\n${details}`);
  }

  return light.size;
}

/* ------------------------------------------------------------------ *
 * Formats
 * ------------------------------------------------------------------ */
function nest(tokens, valueOf) {
  const root = {};
  for (const token of tokens) {
    let cursor = root;
    token.path.slice(0, -1).forEach((segment) => {
      cursor[segment] ??= {};
      cursor = cursor[segment];
    });
    cursor[token.path.at(-1)] = valueOf(token);
  }
  return root;
}

StyleDictionary.registerFormat({
  name: 'manja/json-values',
  format: ({ dictionary }) =>
    `${JSON.stringify(
      nest(dictionary.allTokens, (t) => String(t.value)),
      null,
      2,
    )}\n`,
});

StyleDictionary.registerFormat({
  name: 'manja/json-cssvars',
  format: ({ dictionary }) =>
    `${JSON.stringify(
      nest(dictionary.allTokens, (t) => `var(--${t.name})`),
      null,
      2,
    )}\n`,
});

/* ------------------------------------------------------------------ *
 * Style Dictionary runs — one per theme
 * ------------------------------------------------------------------ */
function configFor(theme) {
  return {
    source: [
      path.join(SRC, 'base', '**', '*.json'),
      path.join(SRC, 'semantic', `${theme}.json`),
    ],
    log: { warnings: 'disabled', verbosity: 'silent' },
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: PREFIX,
        buildPath: path.join(STAGE, theme) + path.sep,
        options: { showFileHeader: false },
        files: [
          {
            destination: 'all.css',
            format: 'css/variables',
            options: { selector: ':root', outputReferences: true, showFileHeader: false },
          },
          {
            // Only used to learn *which* variables belong to the semantic
            // layer; the emitted values come from all.css so that they keep
            // their var() references. See darkSemanticDeclarations below.
            destination: 'semantic.css',
            format: 'css/variables',
            filter: isSemantic,
            options: {
              selector: ':root',
              outputReferences: false,
              showFileHeader: false,
            },
          },
        ],
      },
      data: {
        transformGroup: 'css',
        prefix: PREFIX,
        buildPath: path.join(STAGE, theme) + path.sep,
        files: [
          { destination: 'values.json', format: 'manja/json-values' },
          { destination: 'cssvars.json', format: 'manja/json-cssvars' },
        ],
      },
    },
  };
}

/** Pulls the declaration lines out of a generated `:root { ... }` block. */
async function declarations(file) {
  const css = await readFile(file, 'utf8');
  const body = css.slice(css.indexOf('{') + 1, css.lastIndexOf('}'));
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const block = (selector, lines) =>
  `${selector} {\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;

const varName = (line) => line.slice(0, line.indexOf(':')).trim();

/**
 * Style Dictionary drops var() references when the referenced token is filtered
 * out of a file, so a semantic-only build would inline raw hex. We instead take
 * the declarations from the unfiltered build and keep the semantic ones, which
 * preserves `var(--mj-color-brand-500)` — overriding a base ramp at runtime then
 * re-themes light and dark alike.
 */
async function darkSemanticDeclarations() {
  const all = await declarations(path.join(STAGE, 'dark', 'all.css'));
  const semanticNames = new Set(
    (await declarations(path.join(STAGE, 'dark', 'semantic.css'))).map(varName),
  );
  return all.filter((line) => semanticNames.has(varName(line)));
}

const BANNER = `/**
 * Manja Design System — design tokens.
 * Auto-generated by packages/tokens/build.mjs. Do not edit by hand.
 */`;

async function main() {
  const semanticCount = await assertThemeParity();

  await rm(STAGE, { recursive: true, force: true });
  await rm(DIST, { recursive: true, force: true });
  await mkdir(path.join(DIST, 'css'), { recursive: true });
  await mkdir(GENERATED, { recursive: true });

  for (const theme of THEMES) {
    const sd = new StyleDictionary(configFor(theme));
    await sd.buildAllPlatforms();
  }

  const lightAll = await declarations(path.join(STAGE, 'light', 'all.css'));
  const darkSemantic = await darkSemanticDeclarations();

  // The light block carries the base ramps too, so it doubles as the default
  // `:root`. Dark only ever overrides the semantic layer.
  const lightBlock = block(`:root,\n[${THEME_ATTR}='light']`, lightAll);
  const darkBlock = block(`[${THEME_ATTR}='dark']`, darkSemantic);

  // Honour the OS preference, but only until an explicit theme is set. The
  // `:not([data-mj-theme='light'])` guard is what lets an app force light mode
  // on a machine that is set to dark.
  const darkAutoBlock = [
    '@media (prefers-color-scheme: dark) {',
    block(`  :root:not([${THEME_ATTR}='light'])`, darkSemantic)
      .split('\n')
      .map((line, index) => (index === 0 ? line : `  ${line}`))
      .join('\n'),
    '}',
  ].join('\n');

  const combined = [BANNER, lightBlock, darkBlock, darkAutoBlock, ''].join('\n\n');

  await writeFile(path.join(DIST, 'css', 'tokens.css'), combined);
  await writeFile(
    path.join(DIST, 'css', 'tokens.light.css'),
    [BANNER, lightBlock, ''].join('\n\n'),
  );
  await writeFile(
    path.join(DIST, 'css', 'tokens.dark.css'),
    [BANNER, darkBlock, darkAutoBlock, ''].join('\n\n'),
  );

  const lightValues = await readFile(path.join(STAGE, 'light', 'values.json'), 'utf8');
  const darkValues = await readFile(path.join(STAGE, 'dark', 'values.json'), 'utf8');
  const cssVars = await readFile(path.join(STAGE, 'light', 'cssvars.json'), 'utf8');

  await writeFile(path.join(DIST, 'tokens.json'), lightValues);
  await writeFile(path.join(DIST, 'tokens.dark.json'), darkValues);

  const ts = `${BANNER}

/** Resolved token values for the light theme. */
export const tokens = ${lightValues.trim()} as const;

/** Resolved token values for the dark theme. Semantic layer only differs. */
export const darkTokens = ${darkValues.trim()} as const;

/**
 * \`var(--mj-*)\` references for every token, mirroring the \`tokens\` shape.
 * Prefer these over raw values so components stay theme-reactive.
 */
export const cssVars = ${cssVars.trim()} as const;

export const themes = ${JSON.stringify(THEMES)} as const;
export const themeAttribute = '${THEME_ATTR}' as const;
export const tokenPrefix = '${PREFIX}' as const;
`;

  await writeFile(path.join(GENERATED, 'tokens.ts'), ts);
  await rm(STAGE, { recursive: true, force: true });

  console.log(
    `tokens: ${lightAll.length} variables, ${semanticCount} semantic tokens x ${THEMES.length} themes`,
  );
}

main().catch((error) => {
  console.error(`\ntoken build failed:\n${error.message}\n`);
  process.exitCode = 1;
});
