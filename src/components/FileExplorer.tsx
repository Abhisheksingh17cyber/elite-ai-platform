'use client';

import { motion } from 'framer-motion';
import { 
  FileCode, 
  Shield, 
  Database, 
  Server, 
  FileJson,
  Cloud,
  TestTube,
  FolderOpen
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { cn } from '@/lib/utils';

const fileIcons: Record<string, React.ReactNode> = {
  'main.py': <FileCode className="w-4 h-4 text-yellow-400" />,
  'auth_service.py': <Shield className="w-4 h-4 text-red-400" />,
  'vector_cache.py': <Database className="w-4 h-4 text-purple-400" />,
  'load_balancer.py': <Server className="w-4 h-4 text-blue-400" />,
  'security_scan.py': <Shield className="w-4 h-4 text-green-400" />,
  'tests.py': <TestTube className="w-4 h-4 text-cyan-400" />,
  'docker-compose.yml': <FileJson className="w-4 h-4 text-blue-300" />,
  'terraform/main.tf': <Cloud className="w-4 h-4 text-purple-300" />,
};

export default function FileExplorer() {
  const { files, activeFile, setActiveFile } = useChallengeStore();

  const fileList = Object.keys(files);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0D1117] border border-gray-700 rounded-xl overflow-hidden h-full"
    >
      <div className="bg-[#161B22] px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <FolderOpen className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Project Files</span>
      </div>

      <div className="p-2 space-y-1">
        {fileList.map((filename, index) => (
          <motion.button
            key={filename}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setActiveFile(filename)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
              activeFile === filename
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            )}
          >
            {fileIcons[filename] || <FileCode className="w-4 h-4 text-gray-500" />}
            <span className="text-sm font-mono truncate">{filename}</span>
            {activeFile === filename && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 rounded-full bg-purple-500"
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="border-t border-gray-700 p-4 mt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Resources
        </h4>
        <div className="space-y-2">
          <div className="bg-green-900/30 border border-green-700/30 rounded-lg p-3">
            <p className="font-mono text-xs text-green-400">LLM_API_KEY</p>
            <p className="text-xs text-gray-500 mt-1">100 calls/hr limit</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-3">
            <p className="font-mono text-xs text-blue-400">PINECONE_KEY</p>
            <p className="text-xs text-gray-500 mt-1">Index: prod-cache</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-3">
            <p className="font-mono text-xs text-purple-400">AWS_CREDS</p>
            <p className="text-xs text-gray-500 mt-1">Multi-region access</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
