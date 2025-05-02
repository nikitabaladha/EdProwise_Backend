import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderEmail(headerPath, footerPath, content, data) {
    const header = fs.readFileSync(path.join(__dirname, headerPath), 'utf-8');
    const footer = fs.readFileSync(path.join(__dirname, footerPath), 'utf-8');
    
    const headerRendered = ejs.render(header, data);
    const footerRendered = ejs.render(footer, data);
    
    return `${headerRendered}${content}${footerRendered}`;
}