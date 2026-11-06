import React, { useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Eye, 
  Edit3,
  Sparkles,
  Wand2
} from 'lucide-react';
import AIWritingAssistantModal from './ai/AIWritingAssistantModal';

export const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...' }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedTextSnippet, setSelectedTextSnippet] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const textareaRef = useRef(null);

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      insertFormatting(`<a href="${url}" target="_blank" rel="noopener noreferrer">`, '</a>');
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const alt = prompt('Enter image alt text:') || 'Image';
      const imgTag = `<img src="${url}" alt="${alt}" class="rounded-xl my-4 w-full" />`;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const newValue = textarea.value.substring(0, start) + imgTag + textarea.value.substring(start);
      onChange(newValue);
    }
  };

  const openAiAssistant = () => {
    const textarea = textareaRef.current;
    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setSelectedTextSnippet(textarea.value.substring(start, end));
      setSelectionRange({ start, end });
    } else {
      setSelectedTextSnippet(value || '');
      setSelectionRange({ start: 0, end: (value || '').length });
    }
    setAiModalOpen(true);
  };

  const handleApplyAiText = (newText) => {
    if (selectionRange.start !== selectionRange.end && textareaRef.current) {
      const currentVal = value || '';
      const updated = currentVal.substring(0, selectionRange.start) + newText + currentVal.substring(selectionRange.end);
      onChange(updated);
    } else {
      onChange(newText);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
      
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        <button
          type="button"
          onClick={() => insertFormatting('<strong>', '</strong>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Bold (<strong>)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<em>', '</em>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Italic (<em>)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => insertFormatting('<h2>', '</h2>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Heading 2 (<h2>)"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<h3>', '</h3>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Heading 3 (<h3>)"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<p>', '</p>')}
          className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Paragraph (<p>)"
        >
          P
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Bullet List (<ul>)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<ol>\n  <li>', '</li>\n</ol>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Numbered List (<ol>)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Blockquote (<blockquote>)"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('<pre><code>', '</code></pre>')}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 mx-1"></div>

        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Insert Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Insert Image by URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Phase 2: AI Writing Assistant Toolbar Action */}
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button
          type="button"
          onClick={openAiAssistant}
          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200 flex items-center gap-1.5 transition-colors shadow-sm"
          title="Open AI Writing Assistant (Fix grammar, improve, shorten, expand)"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>AI Assistant</span>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              isPreview ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreview ? 'Edit HTML' : 'Live Preview'}
          </button>
        </div>

      </div>

      {/* Editor or Preview Pane */}
      {isPreview ? (
        <div className="p-6 min-h-[350px] max-h-[500px] overflow-y-auto prose prose-slate max-w-none bg-slate-50/50">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-slate-400 italic">No content to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={14}
          className="w-full p-4 text-sm font-mono text-slate-800 bg-white focus:outline-none resize-y min-h-[300px]"
        ></textarea>
      )}

      {/* Footer helper */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Supports HTML, formatted markup, headings, blockquotes & embeds. Highlight text and click "AI Assistant" to refine selections.</span>
        <span>{value ? value.length : 0} characters</span>
      </div>

      {/* AI Writing Assistant Comparison Modal */}
      <AIWritingAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        originalText={selectedTextSnippet}
        onApply={handleApplyAiText}
      />

    </div>
  );
};

export default RichTextEditor;
