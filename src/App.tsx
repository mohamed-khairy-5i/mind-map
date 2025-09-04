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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Brain, 
  Sparkles, 
  Moon, 
  Sun, 
  Zap,
  Settings,
  Menu,
  Maximize,
  Minimize
} from 'lucide-react';

import EnhancedCustomNode from './components/EnhancedCustomNode';
import AdvancedAIPanel from './components/AdvancedAIPanel';
import EnhancedToolbar from './components/EnhancedToolbar';
import WelcomeScreen from './components/WelcomeScreen';
import { generateMindMap, expandNode, generateMindMapFromURL } from './services/enhancedAIService';
import { exportMindMap, importMindMap } from './utils/fileUtils';

const nodeTypes: NodeTypes = {
  custom: EnhancedCustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 400, y: 300 },
    data: {
      label: 'NeuralMind Pro',
      type: 'central',
      description: 'منصة احترافية لإنشاء الخرائط الذهنية بالذكاء الاصطناعي - تحليل المحتوى من النصوص والروابط والفيديوهات',
      emoji: '🧠',
      color: '#667eea'
    },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem('showWelcome') !== 'false';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{nodes: Node[], edges: Edge[]}>>([]);
  const [redoStack, setRedoStack] = useState<Array<{nodes: Node[], edges: Edge[]}>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleAddNode();
            break;
          case 's':
            e.preventDefault();
            handleExport();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'a':
            e.preventDefault();
            setIsAIPanelOpen(true);
            break;
          case 'd':
            e.preventDefault();
            setDarkMode(!darkMode);
            break;
        }
      } else if (e.key === 'Escape') {
        setIsAIPanelOpen(false);
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [darkMode, undoStack, redoStack]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    setUndoStack(prev => [...prev, { nodes: [...nodes], edges: [...edges] }].slice(-10));
    setRedoStack([]);
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [{ nodes: [...nodes], edges: [...edges] }, ...prev].slice(0, 10));
    setUndoStack(prev => prev.slice(0, -1));
    setNodes(lastState.nodes);
    setEdges(lastState.edges);
  }, [undoStack, nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, { nodes: [...nodes], edges: [...edges] }].slice(-10));
    setRedoStack(prev => prev.slice(1));
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
  }, [redoStack, nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      saveState();
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, saveState]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
  }, [selectedNode]);

  const handleGenerateMindMap = async (prompt: string, inputType: 'text' | 'image' | 'audio' | 'video' | 'url' = 'text', config?: any) => {
    setIsGenerating(true);
    try {
      saveState();
      
      let result;
      if (inputType === 'url') {
        // Generate from URL
        result = await generateMindMapFromURL(prompt, config);
      } else {
        // Generate from text or other inputs
        result = await generateMindMap(prompt, inputType, config);
      }
      
      // Handle the new enhanced response format
      if (result && typeof result === 'object' && 'nodes' in result) {
        setNodes(result.nodes);
        setEdges(result.edges || []);
        // Store metadata for future use
        console.log('Mind map metadata:', result.metadata);
      } else {
        // Backward compatibility with old format
        setNodes(result as Node[]);
        setEdges([]);
      }
      
      setShowWelcome(false);
      localStorage.setItem('showWelcome', 'false');
    } catch (error) {
      console.error('Error generating mind map:', error);
      // Show error notification
      alert('حدث خطأ في إنشاء الخريطة الذهنية: ' + (error as Error).message);
    }
    setIsGenerating(false);
  };

  const handleExpandNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setIsGenerating(true);
    try {
      saveState();
      const { newNodes, newEdges } = await expandNode(node, nodes, edges);
      setNodes(prev => [...prev, ...newNodes]);
      setEdges(prev => [...prev, ...newEdges]);
    } catch (error) {
      console.error('Error expanding node:', error);
    }
    setIsGenerating(false);
  };

  const handleAddNode = () => {
    saveState();
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'custom',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 400 + 200 
      },
      data: {
        label: 'فكرة جديدة',
        type: 'idea',
        description: 'انقر مرتين للتحرير',
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
      saveState();
      importMindMap(file, setNodes, setEdges);
      setShowWelcome(false);
      localStorage.setItem('showWelcome', 'false');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'MindForge - خريطة ذهنية متقدمة',
        text: 'اكتشف قوة الخرائط الذهنية بالذكاء الاصطناعي!',
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Show success notification
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    localStorage.setItem('showWelcome', 'false');
    setTimeout(() => setIsAIPanelOpen(true), 500);
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const templates: Record<string, string> = {
      business: 'أنشئ خطة عمل شاملة تتضمن الرؤية والرسالة وتحليل السوق والاستراتيجية المالية والتسويقية',
      study: 'نظم مادة دراسية مع خطة مراجعة فعالة تشمل المفاهيم الأساسية والتطبيقات العملية',
      creative: 'طور فكرة إبداعية شاملة تتضمن العصف الذهني والتخطيط والتنفيذ والتقييم',
      team: 'خطط لمشروع جماعي مع توزيع المهام والأدوار والجدولة الزمنية'
    };
    
    setShowWelcome(false);
    localStorage.setItem('showWelcome', 'false');
    setIsAIPanelOpen(true);
    
    if (templates[templateId]) {
      setTimeout(() => {
        handleGenerateMindMap(templates[templateId]);
      }, 1000);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const selectedNodesCount = nodes.filter(n => n.selected).length;

  // Show welcome screen for new users
  if (showWelcome) {
    return (
      <WelcomeScreen 
        onGetStarted={handleGetStarted}
        onCreateFromTemplate={handleCreateFromTemplate}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      
      {/* Enhanced Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-slate-200/20 dark:border-slate-700/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo and Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="glass-button p-2 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold gradient-text-animated">NeuralMind Pro</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    منصة احترافية للخرائط الذهنية بالذكاء الاصطناعي
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Quick Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span>العقد: {nodes.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>الروابط: {edges.length}</span>
              </div>
              {selectedNodesCount > 0 && (
                <div className="flex items-center gap-2">
                  <span>المحدد: {selectedNodesCount}</span>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
                className="btn-neural group flex items-center gap-2 px-4 py-2"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">مساعد الذكاء الاصطناعي</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="glass-button p-2"
                title="وضع ملء الشاشة"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="glass-button p-2"
                title="تبديل المظهر"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="glass-button p-2" title="الإعدادات">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        
        {/* Enhanced AI Panel */}
        <AdvancedAIPanel 
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
            defaultEdgeOptions={{
              animated: true,
              style: { strokeWidth: 2 }
            }}
          >
            <Controls 
              className="glass-panel !border-slate-200/20 dark:!border-slate-700/20" 
              showInteractive={false}
            />
            
            <MiniMap 
              className="glass-panel !border-slate-200/20 dark:!border-slate-700/20" 
              nodeColor={(node: Node) => (node.data as any)?.color || '#667eea'}
              pannable
              zoomable
            />
            
            <Background 
              variant={'dots' as any} 
              gap={20} 
              size={1} 
              className="opacity-30 dark:opacity-20" 
            />

            {/* Enhanced Toolbar */}
            <Panel position="top-left" className="m-4">
              <EnhancedToolbar
                onAddNode={handleAddNode}
                onExport={handleExport}
                onImport={handleImport}
                onShare={handleShare}
                onExpandNode={selectedNode ? () => handleExpandNode(selectedNode) : undefined}
                isGenerating={isGenerating}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitView={fitView}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                selectedNodes={selectedNodesCount}
              />
            </Panel>

            {/* Status Panel */}
            <Panel position="bottom-right" className="m-4">
              <div className="glass-panel p-3">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>متصل</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>تم الحفظ</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>v2.0</span>
                </div>
              </div>
            </Panel>

            {/* Enhanced Loading Overlay */}
            {isGenerating && (
              <Panel position="top-center" className="m-4">
                <div className="glass-panel p-6 flex items-center gap-4 animate-scale-in">
                  <div className="relative">
                    <div className="spinner-neural w-8 h-8"></div>
                    <Sparkles className="absolute inset-0 w-8 h-8 animate-pulse text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      جاري إنشاء الخريطة الذهنية...
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      يتم استخدام الذكاء الاصطناعي المتقدم
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* Quick Help */}
            <Panel position="bottom-left" className="m-4">
              <div className="glass-panel p-3 max-w-xs">
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Ctrl+N</kbd> عقدة جديدة</div>
                  <div><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Ctrl+A</kbd> مساعد AI</div>
                  <div><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Del</kbd> حذف المحدد</div>
                  <div><kbd className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs">Ctrl+Z</kbd> تراجع</div>
                </div>
              </div>
            </Panel>
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

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsAIPanelOpen(true)}
        className="fab lg:hidden"
        title="مساعد الذكاء الاصطناعي"
      >
        <Brain className="w-6 h-6" />
      </button>
    </div>
  );
}

export default App;