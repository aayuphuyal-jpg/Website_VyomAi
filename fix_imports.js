import fs from 'fs';
import path from 'path';

const serverDir = "/Users/shekharphuyal/Documents/AntiGravity/VyomAiSite-11zip/server"

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Match relative imports that don't already have an extension
            // This handles both single and double quotes
            // and cases like ./file, ../file, ./folder/file
            const updatedContent = content.replace(
                /(import\s+.*?from\s+['"])(\.\.?\/.*?)(['"])/g,
                (match, p1, p2, p3) => {
                    if (p2.endsWith('.js') || p2.endsWith('.css') || p2.endsWith('.json')) {
                        return match;
                    }
                    const importPath = path.resolve(dir, p2);
                    if (fs.existsSync(importPath) && fs.statSync(importPath).isDirectory()) {
                        return `${p1}${p2}/index.js${p3}`;
                    }
                    return `${p1}${p2}.js${p3}`;
                }
            ).replace(
                /(import\s+['"])(\.\.?\/.*?)(['"])/g,
                (match, p1, p2, p3) => {
                    if (p2.endsWith('.js') || p2.endsWith('.css') || p2.endsWith('.json')) {
                        return match;
                    }
                    const importPath = path.resolve(dir, p2);
                    if (fs.existsSync(importPath) && fs.statSync(importPath).isDirectory()) {
                        return `${p1}${p2}/index.js${p3}`;
                    }
                    return `${p1}${p2}.js${p3}`;
                }
            ).replace(
                /(import\(["'])(\.\.?\/.*?)(["']\))/g,
                (match, p1, p2, p3) => {
                    if (p2.endsWith('.js') || p2.endsWith('.css') || p2.endsWith('.json')) {
                        return match;
                    }
                    const importPath = path.resolve(dir, p2);
                    if (fs.existsSync(importPath) && fs.statSync(importPath).isDirectory()) {
                        return `${p1}${p2}/index.js${p3}`;
                    }
                    return `${p1}${p2}.js${p3}`;
                }
            ).replace(
                /@shared\/schema/g,
                () => {
                    const relativePath = path.relative(dir, path.join(serverDir.replace('/shared', ''), 'shared', 'schema.js'));
                    return relativePath.startsWith('.') ? relativePath : './' + relativePath;
                }
            );

            if (content !== updatedContent) {
                console.log(`Updating ${fullPath}`);
                fs.writeFileSync(fullPath, updatedContent);
            }
        }
    }
}

processDirectory(serverDir);
console.log('Done!');
