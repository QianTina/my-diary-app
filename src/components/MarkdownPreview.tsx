import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
  isDark?: boolean;
}

export default function MarkdownPreview({ content, isDark = false }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          // 自定义样式
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a 
              href={href} 
              className={isDark ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className={`px-1 py-0.5 rounded text-sm font-mono ${
              isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
            }`}>
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 italic ${
              isDark 
                ? 'border-gray-600 text-gray-300' 
                : 'border-gray-300 text-gray-700'
            }`}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
