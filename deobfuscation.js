const fs = require('fs');
const path = require('path');
const { formatText } = require('lua-fmt');

function deobfuscateScript(obfuscatedScript) {
    try {
        const encodedPattern = /local \w+ = \{\s*([^}]+)\s*\}/;
        const matches = obfuscatedScript.match(new RegExp(encodedPattern, 'g'));

        if (matches && matches.length >= 2) {
            const encodedParts = matches[0].match(encodedPattern)[1].split(',').map(str => parseInt(str.trim(), 10));
            const randomOffsets = matches[1].match(encodedPattern)[1].split(',').map(str => parseInt(str.trim(), 10));

            let originalScript = '';

            for (let i = 0; i < encodedParts.length; i++) {
                originalScript += String.fromCharCode(encodedParts[i] - randomOffsets[i]);
            }

            originalScript = formatLuaScript(originalScript);

            return originalScript;
        } else {
            throw new Error('Failed to extract encoded parts or offsets.');
        }

    } catch (e) {
        console.error('Deobfuscation failed:', e);
        return null;
    }
}

function formatLuaScript(script) {
    return formatText(script);
}

function processFile(inputPath, outputPath) {
    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        const originalScript = deobfuscateScript(data);
        if (originalScript) {
            fs.writeFile(outputPath, originalScript, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing file: ${err}`);
                } else {
                    console.log(`Deobfuscated script saved to: ${outputPath}`);
                }
            });
        }
    });
}

const inputFilePath = path.join(__dirname, 'obf.txt');
const outputFilePath = path.join(__dirname, 'result.lua');
processFile(inputFilePath, outputFilePath);
