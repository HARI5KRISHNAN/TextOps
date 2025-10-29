import React from 'react';
import { CopyIcon } from './icons';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-background-panel rounded-lg my-2 relative group">
      <div className="flex justify-between items-center px-4 py-2 border-b border-border-color">
        <span className="text-xs font-semibold text-text-secondary">{language || 'code'}</span>
        <button 
          onClick={handleCopyCode}
          className="text-text-secondary/60 hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center gap-1"
        >
          <CopyIcon className="w-3.5 h-3.5" />
          Copy code
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;