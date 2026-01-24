'use client';

import { useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { useChallengeStore } from '@/store/challengeStore';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  height?: string;
}

export default function CodeEditor({ height = '500px' }: CodeEditorProps) {
  const { code, activeFile, updateCode, challengeStarted } = useChallengeStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Custom theme
    monaco.editor.defineTheme('eliteTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#C9D1D9',
        'editor.lineHighlightBackground': '#161B22',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#58A6FF',
        'editorLineNumber.foreground': '#6E7681',
        'editorLineNumber.activeForeground': '#C9D1D9',
      },
    });
    
    monaco.editor.setTheme('eliteTheme');
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Auto-save is already enabled, but show feedback
      console.log('Code saved automatically');
    });
  };

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      updateCode(value);
    }
  };

  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescriptreact',
      'jsx': 'javascriptreact',
      'json': 'json',
      'yml': 'yaml',
      'yaml': 'yaml',
      'tf': 'hcl',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'dockerfile',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
      style={{ height }}
    >
      <div className="bg-[#161B22] px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-gray-400 text-sm font-mono">{activeFile}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {challengeStarted ? '🔴 Live' : '⚪ Ready'}
          </span>
          <span className="text-xs text-green-400">Autosave ON</span>
        </div>
      </div>
      
      <Editor
        height={`calc(${height} - 40px)`}
        language={getLanguage(activeFile)}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 0.8 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 4,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          readOnly: !challengeStarted,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-[#0D1117]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400">Loading Editor...</span>
            </div>
          </div>
        }
      />
    </motion.div>
  );
}
