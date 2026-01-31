import { getDocBySlug, getDocSlugs, getAllDocs } from '@/lib/docs';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getDocSlugs();
    return slugs.map((file) => ({
        slug: file.replace('.md', ''),
    }));
}

export async function generateMetadata(props: PageProps) {
    const params = await props.params;
    const doc = getDocBySlug(params.slug);
    return {
        title: `${doc.meta.title} | Stoic Docs`,
        description: doc.meta.description,
    };
}

export default async function DocPage(props: PageProps) {
    const params = await props.params;
    const doc = getDocBySlug(params.slug);

    return (
        <article className="prose prose-invert prose-slate max-w-none 
      prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-100
      prose-h1:text-4xl prose-h1:mb-6
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-800
      prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
      prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white prose-strong:font-bold
      prose-code:text-cyan-300 prose-code:bg-slate-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-4
      prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-slate-900/30 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:not-italic
      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
      prose-li:text-slate-300 prose-li:mb-2
    ">
            {/* 
          We render the title manually above the markdown content if desired, 
          but usually the markdown h1 is sufficient if the file has one. 
          Assuming files start with h1. If frontmatter title is preferred as h1, we can add it here.
       */}
            {/* <h1 className="text-4xl font-black mb-8">{doc.meta.title}</h1> */}

            <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
            >
                {doc.content}
            </ReactMarkdown>
        </article>
    );
}
