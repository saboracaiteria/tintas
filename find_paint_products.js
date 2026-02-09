
const fs = require('fs');
const path = require('path');

const csvPath = 'c:\\Users\\Terminal\\Documents\\sabor1\\produtos.csv';
const outputPath = 'found_paint_products.txt';
const errorPath = 'error_log.txt';

const keywords = [
    'TINTA', 'PINTURA', 'ESMALTE', 'VERNIZ', 'SELADOR', 'MASSA', 'CORRIDA',
    'ACRILICA', 'LATEX', 'PISO', 'DEMARCACAO', 'SPRAY', 'AEROSSOL',
    'AGUARRAS', 'THINNER', 'DILUENTE', 'SOLVENTE',
    'VEDACIT', 'NEUTROL', 'VEDAPREN', 'IMPERMEABILIZANTE', 'MANTA', 'LIQUIDA',
    'ASFA', 'BETUME', 'ECOL', 'BIANCO', 'IGOL', 'DRYKO', 'SIKA',
    'ROLO', 'PINCEL', 'BROXA', 'LIXA', 'BANDEJA', 'BATEDOR'
];

try {
    // Try reading as latin1 (binary/buffer then convert)
    const buffer = fs.readFileSync(csvPath);
    // basic "latin1" to utf8 strategy if iconv not available: 
    // treat bytes as chars directly which preserves 8-bit chars in JS strings usually.
    const data = buffer.toString('latin1');

    const lines = data.split('\n');
    const found = [];

    console.log(`Scanning ${lines.length} lines for ${keywords.length} keywords...`);

    lines.forEach((line, index) => {
        const upperLine = line.toUpperCase();
        for (const keyword of keywords) {
            if (upperLine.includes(keyword)) {
                found.push(`${index + 1}: ${line.trim()}`);
                break;
            }
        }
    });

    fs.writeFileSync(outputPath, found.join('\n'), 'utf8');
    console.log(`Found ${found.length} matching products. Matches saved to ${outputPath}`);

} catch (err) {
    fs.writeFileSync(errorPath, err.toString());
    console.error('Error:', err);
    process.exit(1);
}
