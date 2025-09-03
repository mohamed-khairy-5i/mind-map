import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Node, type Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

// Initialize Google AI with the API key
const API_KEY = 'AIzaSyByEXNDlu9kNaxJWxm7mxxe5vmAqe98DpE';
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

interface MindMapData {
  title: string;
  nodes: {
    id: string;
    label: string;
    type: 'central' | 'category' | 'idea' | 'task';
    description?: string;
    emoji?: string;
    color?: string;
    emotion?: 'positive' | 'negative' | 'neutral';
    priority?: 'high' | 'medium' | 'low';
    position: { x: number; y: number };
    parentId?: string;
  }[];
  connections: {
    from: string;
    to: string;
  }[];
}

// Generate mind map from text prompt
export async function generateMindMap(
  prompt: string, 
  _inputType: 'text' | 'image' | 'audio' | 'video' = 'text'
): Promise<Node[]> {
  try {
    const systemPrompt = `
أنت مساعد ذكي متخصص في إنشاء الخرائط الذهنية. مهمتك إنشاء خريطة ذهنية شاملة ومنظمة بناءً على الموضوع المعطى.

متطلبات الإخراج:
1. أنشئ عقدة مركزية واحدة للموضوع الرئيسي
2. أضف 4-8 عقد فئات رئيسية متصلة بالعقدة المركزية
3. لكل فئة رئيسية، أضف 2-5 عقد فرعية (أفكار أو مهام)
4. استخدم emojis مناسبة لكل عقدة
5. حدد نوع كل عقدة: central, category, idea, task
6. أضف وصف مختصر لكل عقدة
7. حلل المشاعر لكل عقدة: positive, negative, neutral
8. حدد الأولوية للمهام: high, medium, low

أرجع البيانات بتنسيق JSON التالي:
{
  "title": "عنوان الخريطة الذهنية",
  "nodes": [
    {
      "id": "معرف فريد",
      "label": "نص العقدة",
      "type": "نوع العقدة",
      "description": "وصف مختصر",
      "emoji": "رمز تعبيري",
      "color": "رمز اللون hex",
      "emotion": "تحليل المشاعر",
      "priority": "الأولوية (للمهام فقط)",
      "position": {"x": 0, "y": 0},
      "parentId": "معرف العقدة الأب"
    }
  ],
  "connections": [
    {"from": "معرف المصدر", "to": "معرف الوجهة"}
  ]
}

الموضوع المطلوب: ${prompt}
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('لم يتم العثور على استجابة JSON صحيحة');
    }

    const mindMapData: MindMapData = JSON.parse(jsonMatch[0]);
    
    // Convert to React Flow nodes
    const nodes: Node[] = mindMapData.nodes.map((nodeData, index) => ({
      id: nodeData.id || uuidv4(),
      type: 'custom',
      position: calculateNodePosition(nodeData, index, mindMapData.nodes),
      data: {
        label: nodeData.label,
        type: nodeData.type,
        description: nodeData.description,
        emoji: nodeData.emoji,
        color: nodeData.color || getDefaultColor(nodeData.type),
        emotion: nodeData.emotion,
        priority: nodeData.priority
      }
    }));

    return nodes;

  } catch (error) {
    console.error('Error generating mind map:', error);
    
    // Fallback: create a simple mind map
    return createFallbackMindMap(prompt);
  }
}

// Expand a node with AI-generated sub-nodes
export async function expandNode(
  selectedNode: Node, 
  _existingNodes: Node[], 
  _existingEdges: Edge[]
): Promise<{ newNodes: Node[], newEdges: Edge[] }> {
  try {
    const systemPrompt = `
بناءً على العقدة "${selectedNode.data.label}" وسياقها "${selectedNode.data.description || ''}", 
قم بإنشاء 3-6 عقد فرعية مفيدة ومترابطة.

أرجع البيانات بتنسيق JSON:
{
  "nodes": [
    {
      "label": "نص العقدة الفرعية",
      "type": "idea",
      "description": "وصف العقدة",
      "emoji": "رمز تعبيري",
      "color": "لون العقدة",
      "emotion": "positive/negative/neutral",
      "priority": "high/medium/low"
    }
  ]
}
`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('لم يتم العثور على استجابة JSON صحيحة');
    }

    const expandData = JSON.parse(jsonMatch[0]);
    
    const newNodes: Node[] = expandData.nodes.map((nodeData: any, index: number) => ({
      id: uuidv4(),
      type: 'custom',
      position: calculateChildPosition(selectedNode.position, index, expandData.nodes.length),
      data: {
        label: nodeData.label,
        type: nodeData.type || 'idea',
        description: nodeData.description,
        emoji: nodeData.emoji,
        color: nodeData.color || '#10b981',
        emotion: nodeData.emotion,
        priority: nodeData.priority
      }
    }));

    const newEdges: Edge[] = newNodes.map(node => ({
      id: `edge_${selectedNode.id}_${node.id}`,
      source: selectedNode.id,
      target: node.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: (selectedNode.data as any)?.color || '#667eea', strokeWidth: 2 }
    }));

    return { newNodes, newEdges };

  } catch (error) {
    console.error('Error expanding node:', error);
    
    // Fallback expansion
    return createFallbackExpansion(selectedNode);
  }
}

// Analyze emotion of text content
export async function analyzeEmotion(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const prompt = `
حلل المشاعر في النص التالي وحدد ما إذا كانت إيجابية أم سلبية أم محايدة.
أرجع كلمة واحدة فقط: positive أو negative أو neutral

النص: "${text}"
`;

    const result = await model.generateContent(prompt);
    const emotion = result.response.text().trim().toLowerCase();
    
    if (emotion.includes('positive')) return 'positive';
    if (emotion.includes('negative')) return 'negative';
    return 'neutral';

  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return 'neutral';
  }
}

// Generate suggestions based on context
export async function generateSuggestions(
  context: string,
  nodeType: 'category' | 'idea' | 'task'
): Promise<string[]> {
  try {
    const prompt = `
بناءً على السياق "${context}", اقترح 5 أفكار ${nodeType === 'category' ? 'فئات رئيسية' : nodeType === 'idea' ? 'أفكار' : 'مهام'} ذات صلة.
أرجع قائمة بسيطة، عنصر واحد في كل سطر.
`;

    const result = await model.generateContent(prompt);
    const suggestions = result.response.text()
      .split('\n')
      .map(line => line.replace(/^[\d\-\*\•]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);
    
    return suggestions;

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return ['اقتراح 1', 'اقتراح 2', 'اقتراح 3'];
  }
}

// Helper functions
function calculateNodePosition(
  nodeData: any, 
  index: number, 
  allNodes: any[]
): { x: number, y: number } {
  const centerX = 400;
  const centerY = 300;
  
  if (nodeData.type === 'central') {
    return { x: centerX, y: centerY };
  }
  
  const parentNode = allNodes.find(n => n.id === nodeData.parentId);
  if (parentNode) {
    // Position around parent
    const angle = (index * 60) * (Math.PI / 180);
    const radius = nodeData.type === 'category' ? 200 : 120;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  }
  
  // Default circular layout
  const angle = (index * 45) * (Math.PI / 180);
  const radius = nodeData.type === 'category' ? 200 : 300;
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
}

function calculateChildPosition(
  parentPosition: { x: number, y: number }, 
  index: number, 
  totalChildren: number
): { x: number, y: number } {
  const angle = (index / totalChildren) * 2 * Math.PI - Math.PI / 2;
  const radius = 150;
  
  return {
    x: parentPosition.x + Math.cos(angle) * radius,
    y: parentPosition.y + Math.sin(angle) * radius
  };
}

function getDefaultColor(nodeType: string): string {
  switch (nodeType) {
    case 'central': return '#667eea';
    case 'category': return '#4f46e5';
    case 'idea': return '#10b981';
    case 'task': return '#f59e0b';
    default: return '#6b7280';
  }
}

function createFallbackMindMap(prompt: string): Node[] {
  const centralNode: Node = {
    id: 'central-1',
    type: 'custom',
    position: { x: 400, y: 300 },
    data: {
      label: prompt || 'الموضوع الرئيسي',
      type: 'central',
      description: 'العقدة المركزية للخريطة الذهنية',
      emoji: '🧠',
      color: '#667eea'
    }
  };

  const categoryNodes: Node[] = [
    {
      id: 'cat-1',
      type: 'custom',
      position: { x: 200, y: 150 },
      data: {
        label: 'الفكرة الأولى',
        type: 'category',
        description: 'تطوير الفكرة الأساسية',
        emoji: '💡',
        color: '#4f46e5'
      }
    },
    {
      id: 'cat-2',
      type: 'custom',
      position: { x: 600, y: 150 },
      data: {
        label: 'الفكرة الثانية',
        type: 'category',
        description: 'توسيع النطاق',
        emoji: '🚀',
        color: '#4f46e5'
      }
    }
  ];

  return [centralNode, ...categoryNodes];
}

function createFallbackExpansion(selectedNode: Node): { newNodes: Node[], newEdges: Edge[] } {
  const newNodes: Node[] = [
    {
      id: uuidv4(),
      type: 'custom',
      position: { 
        x: selectedNode.position.x - 120, 
        y: selectedNode.position.y + 100 
      },
      data: {
        label: 'نقطة فرعية 1',
        type: 'idea',
        description: 'تفصيل إضافي',
        emoji: '📝',
        color: '#10b981'
      }
    },
    {
      id: uuidv4(),
      type: 'custom',
      position: { 
        x: selectedNode.position.x + 120, 
        y: selectedNode.position.y + 100 
      },
      data: {
        label: 'نقطة فرعية 2',
        type: 'idea',
        description: 'معلومات إضافية',
        emoji: '🔍',
        color: '#10b981'
      }
    }
  ];

  const newEdges: Edge[] = newNodes.map(node => ({
    id: `edge_${selectedNode.id}_${node.id}`,
    source: selectedNode.id,
    target: node.id,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  }));

  return { newNodes, newEdges };
}