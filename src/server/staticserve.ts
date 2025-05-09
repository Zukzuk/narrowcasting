import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

export default function staticServeDocs(server: any, APP_DOCS_PATH: string) {
    // __dirname emulation in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const APP_DOCS_ABS_PATH = path.resolve(__dirname, '../../', APP_DOCS_PATH);
    server.use('/docs', express.static(APP_DOCS_ABS_PATH));
    server.get('/docs', (req: any, res: any) => {
        res.sendFile(path.join(APP_DOCS_ABS_PATH, 'index.html'));
    });
    server.get('/docs/*', (req: any, res: any) => {
        res.sendFile(path.join(APP_DOCS_ABS_PATH, 'index.html'));
    });
}