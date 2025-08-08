import React, { useState, useEffect } from 'react';
import Icon from '@/src/components/AppIcon';
import Image from '@/src/components/AppImage';

const BlogContent = ({ content, tableOfContents }) => {
  const [selectedText, setSelectedText] = useState('');
  const [showQuoteShare, setShowQuoteShare] = useState(false);
  const [quotePosition, setQuotePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0) {
        setSelectedText(text);
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setQuotePosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowQuoteShare(true);
      } else {
        setShowQuoteShare(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, []);

  const handleQuoteShare = (platform) => {
    const quote = `"${selectedText}"`;
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(quote)}&url=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(quote);
        break;
    }
    setShowQuoteShare(false);
  };

  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}`;
        return (
          <HeadingTag
            key={index}
            id={block.id}
            className={`font-bold text-foreground mb-4 mt-8 ${
              block.level === 2 ? 'text-2xl' : 
              block.level === 3 ? 'text-xl' : 'text-lg'
            }`}
          >
            {block.content}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={index} className="text-foreground leading-relaxed mb-6 text-lg">
            {block.content}
          </p>
        );

      case 'image':
        return (
          <figure key={index} className="my-8">
            <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden">
              <Image
                src={block.src}
                alt={block.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {block.caption && (
              <figcaption className="text-center text-sm text-text-secondary mt-3 italic">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );

      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-6 my-8 italic">
            <p className="text-xl text-foreground leading-relaxed mb-2">
              "{block.content}"
            </p>
            {block.author && (
              <cite className="text-text-secondary text-sm">— {block.author}</cite>
            )}
          </blockquote>
        );

      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag key={index} className={`mb-6 ${block.ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-2`}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-foreground leading-relaxed">
                {item}
              </li>
            ))}
          </ListTag>
        );

      case 'code':
        return (
          <div key={index} className="my-6">
            <div className="bg-muted rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-foreground">
                <code>{block.content}</code>
              </pre>
            </div>
            {block.language && (
              <p className="text-xs text-text-secondary mt-2">Language: {block.language}</p>
            )}
          </div>
        );

      case 'divider':
        return (
          <hr key={index} className="border-border my-8" />
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        {content.map((block, index) => renderContentBlock(block, index))}
      </article>

      {/* Text Selection Quote Share */}
      {showQuoteShare && (
        <div
          className="fixed bg-popover border border-border rounded-lg shadow-modal p-2 z-1010 flex items-center space-x-2"
          style={{
            left: quotePosition.x - 75,
            top: quotePosition.y - 60
          }}
        >
          <button
            onClick={() => handleQuoteShare('twitter')}
            className="p-2 hover:bg-muted rounded-md transition-micro"
            title="Share quote on Twitter"
          >
            <Icon name="Twitter" size={16} className="text-blue-500" />
          </button>
          <button
            onClick={() => handleQuoteShare('linkedin')}
            className="p-2 hover:bg-muted rounded-md transition-micro"
            title="Share quote on LinkedIn"
          >
            <Icon name="Linkedin" size={16} className="text-primary" />
          </button>
          <button
            onClick={() => handleQuoteShare('copy')}
            className="p-2 hover:bg-muted rounded-md transition-micro"
            title="Copy quote"
          >
            <Icon name="Copy" size={16} className="text-text-secondary" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogContent;