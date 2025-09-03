import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Node, type Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

// Enhanced AI Configuration
const API_KEY = 'AIzaSyByEXNDlu9kNaxJWxm7mxxe5vmAqe98DpE';
const genAI = new GoogleGenerativeAI(API_KEY);

// Available AI models
const models = {
  'gemini-pro': genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }),
  'gemini-ultra': genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  }),
  'custom': genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
};

interface AIConfig {
  model: 'gemini-pro' | 'gemini-ultra' | 'custom';
  creativity: number; // 0-100
  depth: number; // 0-100
  language: 'ar' | 'en' | 'mixed';
  style: 'professional' | 'creative' | 'academic' | 'casual';
  includeEmojis: boolean;
  includeColors: boolean;
  maxNodes: number;
}

interface EnhancedMindMapData {
  title: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  nodes: {
    id: string;
    label: string;
    type: 'central' | 'category' | 'idea' | 'task' | 'note' | 'question';
    description?: string;
    emoji?: string;
    color?: string;
    emotion?: 'positive' | 'negative' | 'neutral';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    metadata?: {
      confidence: number;
      relevance: number;
      actionable: boolean;
    };
    position: { x: number; y: number };
    parentId?: string;
  }[];
  connections: {
    from: string;
    to: string;
    type: 'hierarchy' | 'association' | 'dependency' | 'similarity';
    strength: number;
    label?: string;
  }[];
  suggestions?: {
    improvements: string[];
    expansions: string[];
    alternatives: string[];
  };
}

// Enhanced mind map generation with advanced AI
export async function generateEnhancedMindMap(
  prompt: string,
  inputType: 'text' | 'image' | 'audio' | 'video' = 'text',
  config: AIConfig = {
    model: 'gemini-pro',
    creativity: 70,
    depth: 60,
    language: 'ar',
    style: 'professional',
    includeEmojis: true,
    includeColors: true,
    maxNodes: 20
  }
): Promise<{ nodes: Node[], edges: Edge[], metadata: any }> {
  try {
    const model = models[config.model];
    
    const systemPrompt = generateSystemPrompt(config, inputType);
    const enhancedPrompt = enhanceUserPrompt(prompt, config);
    
    const fullPrompt = `${systemPrompt}\n\nالموضوع المطلوب: ${enhancedPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Extract and parse JSON response
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('لم يتم العثور على استجابة JSON صحيحة');
    }

    const mindMapData: EnhancedMindMapData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    // Convert to React Flow format with enhanced positioning
    const { nodes, edges } = convertToReactFlow(mindMapData, config);
    
    // Add metadata for analytics and improvements
    const metadata = {
      generatedAt: new Date().toISOString(),
      prompt: prompt,
      config: config,
      aiModel: config.model,
      complexity: mindMapData.complexity,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      suggestions: mindMapData.suggestions || {},
      performance: {
        generation_time: Date.now() // Will be updated by caller
      }
    };

    return { nodes, edges, metadata };

  } catch (error) {
    console.error('Error generating enhanced mind map:', error);
    return createIntelligentFallback(prompt, config);
  }
}

// Advanced node expansion with contextual AI
export async function expandNodeIntelligent(
  selectedNode: Node,
  existingNodes: Node[],
  existingEdges: Edge[],
  config: AIConfig = {
    model: 'gemini-pro',
    creativity: 70,
    depth: 60,
    language: 'ar',
    style: 'professional',
    includeEmojis: true,
    includeColors: true,
    maxNodes: 20
  }
): Promise<{ newNodes: Node[], newEdges: Edge[], insights: any }> {
  try {
    const model = models[config.model];
    
    // Analyze context from existing nodes
    const context = analyzeExistingContext(selectedNode, existingNodes, existingEdges);
    
    const expansionPrompt = `
أنت خبير في إنشاء الخرائط الذهنية المتقدمة. مهمتك توسيع العقدة المحددة بطريقة ذكية ومترابطة.

معلومات السياق:
- العقدة المحددة: "${selectedNode.data.label}"
- وصف العقدة: "${selectedNode.data.description || ''}"
- نوع العقدة: ${selectedNode.data.type}
- العقد المرتبطة: ${context.connectedNodes.map((n: any) => n.data.label).join(', ')}
- الموضوع العام: ${context.mainTheme}

متطلبات التوسيع:
1. أنشئ 3-${Math.min(8, config.maxNodes)} عقد فرعية متنوعة ومترابطة
2. تأكد من التنوع في أنواع العقد (أفكار، مهام، ملاحظات، أسئلة)
3. أضف روابط ذكية بين العقد الجديدة والموجودة
4. حافظ على التماسك مع السياق العام
5. استخدم مستوى الإبداع: ${config.creativity}% ومستوى العمق: ${config.depth}%

أرجع البيانات بتنسيق JSON التالي:
\`\`\`json
{
  "expansion_type": "نوع التوسيع (hierarchical/lateral/deep/creative)",
  "nodes": [
    {
      "label": "نص العقدة",
      "type": "نوع العقدة (idea/task/note/question)",
      "description": "وصف تفصيلي",
      "emoji": "${config.includeEmojis ? 'رمز تعبيري مناسب' : ''}",
      "color": "${config.includeColors ? 'لون مناسب' : '#10b981'}",
      "emotion": "positive/negative/neutral",
      "priority": "high/medium/low",
      "tags": ["علامة1", "علامة2"],
      "metadata": {
        "confidence": 0.8,
        "relevance": 0.9,
        "actionable": true
      }
    }
  ],
  "connections": [
    {
      "from": "معرف العقدة المصدر",
      "to": "معرف العقدة الهدف", 
      "type": "hierarchy/association/dependency/similarity",
      "strength": 0.8,
      "label": "وصف العلاقة"
    }
  ],
  "insights": {
    "key_themes": ["موضوع1", "موضوع2"],
    "potential_gaps": ["نقص محتمل1"],
    "next_steps": ["خطوة تالية مقترحة"],
    "cross_references": ["إشارة مرجعية1"]
  }
}
\`\`\`
`;

    const result = await model.generateContent(expansionPrompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('لم يتم العثور على استجابة JSON صحيحة');
    }

    const expansionData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    
    const newNodes: Node[] = expansionData.nodes.map((nodeData: any, index: number) => ({
      id: uuidv4(),
      type: 'custom',
      position: calculateIntelligentPosition(selectedNode, index, expansionData.nodes.length, existingNodes),
      data: {
        label: nodeData.label,
        type: nodeData.type || 'idea',
        description: nodeData.description,
        emoji: nodeData.emoji,
        color: nodeData.color || getIntelligentColor(nodeData.type, config),
        emotion: nodeData.emotion,
        priority: nodeData.priority,
        tags: nodeData.tags || [],
        metadata: nodeData.metadata || {}
      }
    }));

    // Create intelligent connections
    const newEdges: Edge[] = [];
    
    // Connect all new nodes to the selected node
    newNodes.forEach(node => {
      newEdges.push({
        id: `edge_${selectedNode.id}_${node.id}`,
        source: selectedNode.id,
        target: node.id,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: selectedNode.data.color || '#667eea', 
          strokeWidth: 2 
        } as any,
        data: {
          type: 'hierarchy',
          strength: 0.8
        }
      });
    });

    // Add cross-connections between new nodes if specified
    if (expansionData.connections) {
      expansionData.connections.forEach((conn: any) => {
        const sourceNode = newNodes.find(n => n.data.label === conn.from);
        const targetNode = newNodes.find(n => n.data.label === conn.to);
        
        if (sourceNode && targetNode) {
          newEdges.push({
            id: `edge_${sourceNode.id}_${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            type: conn.type === 'hierarchy' ? 'step' : 'default',
            animated: conn.type === 'association',
            style: {
              stroke: getConnectionColor(conn.type),
              strokeWidth: Math.ceil(conn.strength * 3),
              strokeDasharray: conn.type === 'dependency' ? '5,5' : undefined
            },
            label: conn.label,
            data: {
              type: conn.type,
              strength: conn.strength
            }
          });
        }
      });
    }

    return { 
      newNodes, 
      newEdges, 
      insights: expansionData.insights || {}
    };

  } catch (error) {
    console.error('Error expanding node intelligently:', error);
    return createIntelligentExpansionFallback(selectedNode, config);
  }
}

// Advanced content analysis and suggestion system
export async function analyzeContentAndSuggest(
  nodes: Node[],
  edges: Edge[],
  config: AIConfig
): Promise<{
  analysis: any;
  suggestions: string[];
  improvements: string[];
  gaps: string[];
}> {
  try {
    const model = models[config.model];
    
    const analysisPrompt = `
قم بتحليل الخريطة الذهنية التالية وقدم اقتراحات للتحسين:

العقد الموجودة:
${nodes.map(n => `- ${n.data.label}: ${n.data.description || 'لا يوجد وصف'}`).join('\n')}

الروابط الموجودة: ${edges.length} رابط

قم بتحليل:
1. التماسك والترابط
2. التوازن في المحتوى
3. الثغرات المحتملة
4. فرص التحسين
5. اقتراحات للتوسيع

أرجع التحليل بتنسيق JSON:
\`\`\`json
{
  "analysis": {
    "coherence_score": 0.8,
    "balance_score": 0.7,
    "completeness_score": 0.6,
    "complexity_level": "medium",
    "dominant_themes": ["موضوع1", "موضوع2"]
  },
  "suggestions": [
    "اقتراح للتحسين العام 1",
    "اقتراح للتحسين العام 2"
  ],
  "improvements": [
    "تحسين محدد 1",
    "تحسين محدد 2"
  ],
  "gaps": [
    "نقص أو ثغرة 1",
    "نقص أو ثغرة 2"
  ]
}
\`\`\`
`;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createFallbackAnalysis(nodes, edges);
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);

  } catch (error) {
    console.error('Error analyzing content:', error);
    return createFallbackAnalysis(nodes, edges);
  }
}

// Smart template generation
export async function generateSmartTemplate(
  category: string,
  customization: any,
  config: AIConfig
): Promise<{ nodes: Node[], edges: Edge[] }> {
  const templatePrompts: Record<string, string> = {
    'business-plan': 'خطة عمل شاملة تتضمن الرؤية والرسالة وتحليل السوق والاستراتيجية المالية والتسويقية والخطة التشغيلية',
    'study-guide': 'دليل دراسة فعال يشمل المواضيع الأساسية وطرق المراجعة والتقييم الذاتي والجدولة الزمنية',
    'creative-project': 'مشروع إبداعي متكامل من العصف الذهني إلى التنفيذ والتقييم مع مراحل الإبداع والتطوير',
    'team-project': 'مشروع جماعي منظم مع توزيع الأدوار والمهام والتواصل والمتابعة والتقييم',
    'research-map': 'خريطة بحث أكاديمي تشمل المشكلة والأهداف والمنهجية والأدبيات والنتائج المتوقعة',
    'product-launch': 'استراتيجية إطلاق منتج متكاملة تشمل التحليل التنافسي والتسويق والإطلاق والمتابعة'
  };

  const prompt = templatePrompts[category] || category;
  return generateEnhancedMindMap(prompt, 'text', config);
}

// Helper Functions
function generateSystemPrompt(config: AIConfig, inputType: string): string {
  const creativityLevel = config.creativity > 70 ? 'عالي' : config.creativity > 40 ? 'متوسط' : 'منخفض';
  const depthLevel = config.depth > 70 ? 'عميق' : config.depth > 40 ? 'متوسط' : 'سطحي';
  
  return `
أنت مساعد ذكي متخصص في إنشاء الخرائط الذهنية المتقدمة والتفاعلية. مهمتك إنشاء خرائط ذهنية ذات جودة عالية واحترافية.

معايير التصميم:
- مستوى الإبداع: ${creativityLevel} (${config.creativity}%)
- مستوى العمق: ${depthLevel} (${config.depth}%)
- اللغة: ${config.language === 'ar' ? 'العربية' : config.language === 'en' ? 'الإنجليزية' : 'مختلط'}
- الأسلوب: ${config.style}
- الرموز التعبيرية: ${config.includeEmojis ? 'مضمنة' : 'غير مضمنة'}
- الألوان: ${config.includeColors ? 'متنوعة وذكية' : 'افتراضية'}
- عدد العقد الأقصى: ${config.maxNodes}

متطلبات الجودة:
1. إنشاء عقدة مركزية قوية وواضحة
2. 4-8 فئات رئيسية متوازنة ومترابطة
3. 2-6 عقد فرعية لكل فئة رئيسية
4. استخدام أنواع متنوعة من العقد (أفكار، مهام، ملاحظات، أسئلة)
5. تحليل المشاعر والأولوية لكل عقدة
6. إضافة علامات وبيانات وصفية
7. اقتراح تحسينات وتوسيعات

أرجع البيانات بتنسيق JSON المتقدم التالي:
\`\`\`json
{
  "title": "عنوان الخريطة الذهنية",
  "description": "وصف شامل للمحتوى",
  "category": "فئة الموضوع",
  "complexity": "simple/medium/complex",
  "nodes": [/* قائمة العقد */],
  "connections": [/* قائمة الروابط */],
  "suggestions": {
    "improvements": ["تحسين 1", "تحسين 2"],
    "expansions": ["توسيع 1", "توسيع 2"],
    "alternatives": ["بديل 1", "بديل 2"]
  }
}
\`\`\`
`;
}

function enhanceUserPrompt(prompt: string, config: AIConfig): string {
  let enhanced = prompt;
  
  if (config.style === 'academic') {
    enhanced += ' (بأسلوب أكاديمي ومنهجي)';
  } else if (config.style === 'creative') {
    enhanced += ' (بأسلوب إبداعي ومبتكر)';
  } else if (config.style === 'professional') {
    enhanced += ' (بأسلوب مهني ومنظم)';
  }
  
  if (config.depth > 70) {
    enhanced += ' مع تحليل عميق وتفصيلي';
  }
  
  return enhanced;
}

function convertToReactFlow(
  mindMapData: EnhancedMindMapData, 
  config: AIConfig
): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = mindMapData.nodes.map((nodeData, index) => ({
    id: nodeData.id || uuidv4(),
    type: 'custom',
    position: calculateAdvancedPosition(nodeData, index, mindMapData.nodes, mindMapData.complexity),
    data: {
      label: nodeData.label,
      type: nodeData.type,
      description: nodeData.description,
      emoji: nodeData.emoji,
      color: nodeData.color || getIntelligentColor(nodeData.type, config),
      emotion: nodeData.emotion,
      priority: nodeData.priority,
      tags: nodeData.tags || [],
      metadata: nodeData.metadata || {}
    }
  }));

  const edges: Edge[] = mindMapData.connections.map(conn => {
    const sourceNode = nodes.find(n => n.id === conn.from);
    const targetNode = nodes.find(n => n.id === conn.to);
    
    if (!sourceNode || !targetNode) return null;
    
    return {
      id: `edge_${conn.from}_${conn.to}`,
      source: conn.from,
      target: conn.to,
      type: conn.type === 'hierarchy' ? 'smoothstep' : 'default',
      animated: conn.type === 'association',
      style: {
        stroke: getConnectionColor(conn.type),
        strokeWidth: Math.ceil(conn.strength * 3) || 2,
        strokeDasharray: conn.type === 'dependency' ? '5,5' : undefined
      },
      label: conn.label,
      data: {
        type: conn.type,
        strength: conn.strength
      }
    };
  }).filter(Boolean) as Edge[];

  return { nodes, edges };
}

function calculateAdvancedPosition(
  nodeData: any,
  index: number,
  allNodes: any[],
  complexity: string
): { x: number, y: number } {
  const centerX = 500;
  const centerY = 400;
  
  if (nodeData.type === 'central') {
    return { x: centerX, y: centerY };
  }
  
  // Find parent node
  const parentNode = allNodes.find(n => n.id === nodeData.parentId);
  const parentPos = parentNode 
    ? calculateAdvancedPosition(parentNode, 0, allNodes, complexity)
    : { x: centerX, y: centerY };
  
  // Calculate position based on node type and complexity
  const baseRadius = nodeData.type === 'category' ? 250 : 150;
  const complexityMultiplier = complexity === 'complex' ? 1.2 : complexity === 'simple' ? 0.8 : 1;
  const radius = baseRadius * complexityMultiplier;
  
  const siblings = allNodes.filter(n => n.parentId === nodeData.parentId && n.id !== nodeData.id);
  const siblingIndex = siblings.findIndex(n => n.id === nodeData.id);
  const totalSiblings = siblings.length + 1;
  
  const angle = (siblingIndex / totalSiblings) * 2 * Math.PI + (Math.random() - 0.5) * 0.3; // Add slight randomness
  
  return {
    x: parentPos.x + Math.cos(angle) * radius,
    y: parentPos.y + Math.sin(angle) * radius
  };
}

function calculateIntelligentPosition(
  parentNode: Node,
  index: number,
  totalNodes: number,
  existingNodes: Node[]
): { x: number, y: number } {
  const baseRadius = 180;
  const angle = (index / totalNodes) * 2 * Math.PI - Math.PI / 2;
  
  // Avoid overlapping with existing nodes
  let radius = baseRadius;
  let position = {
    x: parentNode.position.x + Math.cos(angle) * radius,
    y: parentNode.position.y + Math.sin(angle) * radius
  };
  
  // Check for overlaps and adjust
  const minDistance = 120;
  let attempts = 0;
  while (attempts < 10) {
    const hasOverlap = existingNodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - position.x, 2) + 
        Math.pow(node.position.y - position.y, 2)
      );
      return distance < minDistance;
    });
    
    if (!hasOverlap) break;
    
    radius += 30;
    position = {
      x: parentNode.position.x + Math.cos(angle) * radius,
      y: parentNode.position.y + Math.sin(angle) * radius
    };
    attempts++;
  }
  
  return position;
}

function getIntelligentColor(nodeType: string, config: AIConfig): string {
  if (!config.includeColors) return '#6b7280';
  
  const colorPalettes = {
    neural: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    warm: ['#f2709c', '#ff9472', '#f093fb', '#ffeaa7'],
    cool: ['#00f2fe', '#4facfe', '#43e97b', '#38f9d7'],
    professional: ['#4f46e5', '#059669', '#dc2626', '#d97706']
  };
  
  const palette = colorPalettes.neural; // Default to neural theme
  
  const typeColors: Record<string, string> = {
    central: palette[0],
    category: palette[1], 
    idea: palette[2],
    task: palette[3],
    note: '#8b5cf6',
    question: '#f59e0b'
  };
  
  return typeColors[nodeType] || palette[0];
}

function getConnectionColor(connectionType: string): string {
  const colors: Record<string, string> = {
    hierarchy: '#667eea',
    association: '#10b981',
    dependency: '#f59e0b',
    similarity: '#8b5cf6'
  };
  
  return colors[connectionType] || '#667eea';
}

function analyzeExistingContext(
  selectedNode: Node,
  existingNodes: Node[],
  existingEdges: Edge[]
): any {
  // Find connected nodes
  const connectedNodeIds = existingEdges
    .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
    .map(edge => edge.source === selectedNode.id ? edge.target : edge.source);
  
  const connectedNodes = existingNodes.filter(node => 
    connectedNodeIds.includes(node.id)
  );
  
  // Identify main theme from central node
  const centralNode = existingNodes.find(node => node.data.type === 'central');
  const mainTheme = centralNode?.data.label || 'موضوع عام';
  
  return {
    connectedNodes,
    mainTheme,
    nodeTypes: existingNodes.map(n => n.data.type),
    totalNodes: existingNodes.length,
    totalEdges: existingEdges.length
  };
}

function createIntelligentFallback(prompt: string, config: AIConfig) {
  const fallbackNodes = [
    {
      id: 'central-fallback',
      type: 'custom' as const,
      position: { x: 400, y: 300 },
      data: {
        label: prompt || 'الموضوع الرئيسي',
        type: 'central',
        description: 'العقدة المركزية - تم إنشاؤها تلقائياً',
        emoji: config.includeEmojis ? '🧠' : '',
        color: '#667eea',
        metadata: { fallback: true }
      }
    }
  ];
  
  return {
    nodes: fallbackNodes,
    edges: [],
    metadata: {
      isFallback: true,
      generatedAt: new Date().toISOString(),
      config
    }
  };
}

function createIntelligentExpansionFallback(selectedNode: Node, config: AIConfig) {
  const fallbackNodes = [
    {
      id: uuidv4(),
      type: 'custom' as const,
      position: {
        x: selectedNode.position.x - 100,
        y: selectedNode.position.y + 120
      },
      data: {
        label: 'فكرة مرتبطة',
        type: 'idea',
        description: 'فكرة مرتبطة بالعقدة الأساسية',
        emoji: config.includeEmojis ? '💡' : '',
        color: '#10b981'
      }
    }
  ];
  
  const fallbackEdges = fallbackNodes.map(node => ({
    id: `edge_${selectedNode.id}_${node.id}`,
    source: selectedNode.id,
    target: node.id,
    type: 'smoothstep' as const,
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  }));
  
  return {
    newNodes: fallbackNodes,
    newEdges: fallbackEdges,
    insights: { fallback: true }
  };
}

function createFallbackAnalysis(nodes: Node[], edges: Edge[]) {
  return {
    analysis: {
      coherence_score: 0.7,
      balance_score: 0.6,
      completeness_score: 0.5,
      complexity_level: 'medium',
      dominant_themes: ['موضوع عام']
    },
    suggestions: [
      'إضافة المزيد من التفاصيل للعقد الموجودة',
      'ربط العقد بروابط منطقية أكثر'
    ],
    improvements: [
      'تحسين وصف العقد',
      'إضافة ألوان متناسقة'
    ],
    gaps: [
      'نقص في التفاصيل',
      'قلة الروابط المتصلة'
    ]
  };
}

// Re-export with backward compatibility
export const generateMindMap = generateEnhancedMindMap;
export const expandNode = expandNodeIntelligent;