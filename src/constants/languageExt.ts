interface LanguageExtMap {
  [key: string]: string;
}

const _languageExtMap: LanguageExtMap = {
  bat: 'bat',
  c: 'cpp',
  clojure: 'clj',
  coffeescript: 'coffee',
  cpp: 'cpp',
  csharp: 'cpp',
  css: 'css',
  fsharp: 'fs',
  go: 'go',
  groovy: 'groovy',
  handlebars: 'handlebars',
  hlsl: 'hlsl',
  html: 'html',
  ini: 'ini',
  java: 'java',
  javascript: 'js',
  javascriptreact: 'js',
  json: 'json',
  jsonc: 'json',
  less: 'less',
  lua: 'lua',
  'objective-c': 'm',
  'objective-cpp': 'mm',
  perl: 'perl',
  perl6: 'perl',
  php: 'jsp',
  plaintext: 'txt',
  powershell: 'ps1',
  python: 'py',
  r: 'r',
  razor: 'cshtml',
  ruby: 'rb',
  rust: 'rs',
  scss: 'scss',
  shaderlab: 'shader',
  shellscript: 'sh',
  swift: 'swift',
  typescript: 'ts',
  typescriptreact: 'ts',
  vb: 'vb',
  xml: 'html',
  xsl: 'html',
  yaml: 'yaml'
};

export function getLanguageExt(languageId: string): string {
  return _languageExtMap[languageId] ?? 'js';
}
