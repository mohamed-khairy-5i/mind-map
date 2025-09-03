import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Panel,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Brain, 
  Sparkles, 
  Moon, 
  Sun, 
  Zap
} from 'lucide-react';

import CustomNode from './components/CustomNode';
import AIPanel from './components/AIPanel';
import Toolbar from './components/Toolbar';
import { generateMindMap, expandNode } from './services/aiService';
import { exportMindMap, importMindMap } from './utils/fileUtils';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 400, y: 300 },
    data: {
      label: 'MindForge',
      type: 'central',
      description: 'أداة إنشاء الخرائط الذهنية بالذكاء الاصطناعي',
      emoji: '🧠',
      color: '#667eea'
    },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [darkMode, setDarkMode] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const handleGenerateMindMap = async (prompt: string, inputType: 'text' | 'image' | 'audio' | 'video' = 'text') => {
    setIsGenerating(true);
    try {
      const newNodes = await generateMindMap(prompt, inputType);
      setNodes(newNodes);
      setEdges([]);
    } catch (error) {
      console.error('Error generating mind map:', error);
    }
    setIsGenerating(false);
  };

  const handleExpandNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsGenerating(true);
    try {
      const { newNodes, newEdges } = await expandNode(node, nodes, edges);
      setNodes(prev => [...prev, ...newNodes]);
      setEdges(prev => [...prev, ...newEdges]);
    } catch (error) {
      console.error('Error expanding node:', error);
    }
    setIsGenerating(false);
  };

  const handleAddNode = () => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 200, y: Math.random() * 400 + 200 },
      data: {
        label: 'فكرة جديدة',
        type: 'idea',
        description: 'اضغط للتحرير',
        emoji: '💡',
        color: '#10b981'
      },
    };
    setNodes(prev => [...prev, newNode]);
  };

  const handleExport = () => {
    exportMindMap(nodes, edges, 'mindforge-map');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMindMap(file, setNodes, setEdges);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'MindForge - خريطة ذهنية',
        text: 'تحقق من هذه الخريطة الذهنية المذهلة!',
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ الرابط!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">MindForge</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">أداة إنشاء الخرائط الذهنية بالذكاء الاصطناعي</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>مساعد الذكاء الاصطناعي</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* AI Panel */}
        <AIPanel 
          isOpen={isAIPanelOpen}
          onClose={() => setIsAIPanelOpen(false)}
          onGenerateMindMap={handleGenerateMindMap}
          isGenerating={isGenerating}
        />

        {/* Mind Map Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Controls className="!bg-white/80 dark:!bg-gray-800/80 !backdrop-blur-lg !border-white/20 dark:!border-gray-700/50" />
            <MiniMap 
              className="!bg-white/80 dark:!bg-gray-800/80 !backdrop-blur-lg !border-white/20 dark:!border-gray-700/50" 
              nodeColor={(node: Node) => (node.data as any)?.color || '#667eea'}
            />
            <Background variant={'dots' as any} gap={20} size={1} className="opacity-30" />

            {/* Toolbar */}
            <Panel position="top-left" className="m-4">
              <Toolbar
                onAddNode={handleAddNode}
                onExport={handleExport}
                onImport={handleImport}
                onShare={handleShare}
                onExpandNode={selectedNode ? () => handleExpandNode(selectedNode) : undefined}
                isGenerating={isGenerating}
              />
            </Panel>

            {/* Status Panel */}
            <Panel position="bottom-right" className="m-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-3 border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>العقد: {nodes.length}</span>
                  <span className="mx-2">|</span>
                  <span>الروابط: {edges.length}</span>
                </div>
              </div>
            </Panel>

            {/* Loading Overlay */}
            {isGenerating && (
              <Panel position="top-center" className="m-4">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-lg p-4 border border-white/20 dark:border-gray-700/50 flex items-center space-x-3">
                  <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">جاري إنشاء الخريطة الذهنية...</span>
                </div>
              </Panel>
            )}
          </ReactFlow>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.mindforge"
            onChange={onFileImport}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

export default App;