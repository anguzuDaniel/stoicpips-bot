import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content is in docs/content, relative to where this script runs.
// In Next.js, process.cwd() is the root of the app (docs folder).
const contentDirectory = path.join(process.cwd(), 'content');

export interface Doc {
    slug: string;
    meta: {
        [key: string]: any;
    };
    content: string;
}

export function getDocSlugs() {
    if (!fs.existsSync(contentDirectory)) {
        console.warn(`Content directory not found at: ${contentDirectory}`);
        return [];
    }
    return fs.readdirSync(contentDirectory).filter((file) => file.endsWith('.md'));
}

export function getDocBySlug(slug: string): Doc {
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = path.join(contentDirectory, `${realSlug}.md`);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Doc not found: ${fullPath}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        slug: realSlug,
        meta: data,
        content,
    };
}

export function getAllDocs(): Doc[] {
    const slugs = getDocSlugs();
    const docs = slugs
        .map((slug) => getDocBySlug(slug))
        // Sort by specific order if needed, or title
        .sort((a, b) => (a.meta.title > b.meta.title ? 1 : -1));
    return docs;
}
