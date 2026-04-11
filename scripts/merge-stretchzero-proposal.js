const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

(async () => {
  const base = '/home/ozawakiryu0902/projects/vonds/proposal';

  // 順序: メイン提案書 → 記事比較サンプル → 同意書 → 撮影ガイド
  const inputs = [
    'stretchzero-photo-seo.pdf',
    'stretchzero-article-sample.pdf',
    'stretchzero-consent-form.pdf',
    'stretchzero-shooting-guide.pdf',
  ];

  const output = path.join(base, 'stretchzero-proposal-ALL.pdf');

  const merged = await PDFDocument.create();
  merged.setTitle('ストレッチゼロ SEO戦略 提案パッケージ');
  merged.setAuthor('株式会社オフィスVONDS');
  merged.setSubject('SANKEN株式会社 中込雄輝様ご提案');
  merged.setCreator('VONDS Inc.');

  for (const file of inputs) {
    const bytes = fs.readFileSync(path.join(base, file));
    const src = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
    console.log(`追加: ${file} (${src.getPageCount()}ページ)`);
  }

  const out = await merged.save();
  fs.writeFileSync(output, out);
  console.log(`\n統合完了: ${output}`);
  console.log(`総ページ数: ${merged.getPageCount()}`);
  console.log(`ファイルサイズ: ${(out.length / 1024 / 1024).toFixed(2)} MB`);
})();
