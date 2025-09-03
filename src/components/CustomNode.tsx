import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Sparkles,
  Heart,
  Brain,
  Lightbulb,
  Star,
  Target
} from 'lucide-react';

interface CustomNodeData {
  label: string;
  type: 'central' | 'category' | 'idea' | 'task';
  description?: string;
  emoji?: string;
  color?: string;
  emotion?: 'positive' | 'negative' | 'neutral';
  priority?: 'high' | 'medium' | 'low';
}

const CustomNode: React.FC<NodeProps> = ({ 
  data, 
  selected 
}) => {
  const nodeData = data as unknown as CustomNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(nodeData.label);
  const [,] = useState(nodeData.description || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = () => {
    // Update node data (would typically use a callback from parent)
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setLabel(nodeData.label);
      setIsEditing(false);
    }
  };

  const getNodeIcon = () => {
    switch (nodeData.type) {
      case 'central':
        return <Brain className="w-5 h-5" />;
      case 'category':
        return <Star className="w-4 h-4" />;
      case 'idea':
        return <Lightbulb className="w-4 h-4" />;
      case 'task':
        return <Target className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getEmotionColor = () => {
    switch (nodeData.emotion) {
      case 'positive':
        return 'ring-green-400 bg-green-50 dark:bg-green-900/20';
      case 'negative':
        return 'ring-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'ring-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getPriorityColor = () => {
    switch (nodeData.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <div 
      className={`
        mindmap-node ${nodeData.type} ${getPriorityColor()}
        ${selected ? 'ring-2 ring-primary-500 ring-opacity-60' : ''}
        ${nodeData.emotion ? getEmotionColor() : ''}
        min-w-[160px] max-w-[280px] p-4 border-l-4
        group relative
      `}
      onDoubleClick={handleDoubleClick}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-primary-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-primary-500 !border-2 !border-white" />

      {/* Node Content */}
      <div className="flex items-start space-x-3">
        {/* Icon/Emoji */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${nodeData.type === 'central' 
            ? 'bg-white/20 text-white' 
            : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
          }
        `}>
          {nodeData.emoji ? (
            <span className="text-lg">{nodeData.emoji}</span>
          ) : (
            getNodeIcon()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none outline-none font-medium text-sm"
            />
          ) : (
            <h3 className="font-medium text-sm leading-tight text-gray-800 dark:text-white truncate">
              {nodeData.label}
            </h3>
          )}
          
          {nodeData.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {nodeData.description}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {nodeData.emotion && (
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${nodeData.emotion === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${nodeData.emotion === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                ${nodeData.emotion === 'neutral' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' : ''}
              `}>
                <Heart className="w-3 h-3 mr-1" />
                {nodeData.emotion === 'positive' ? 'إيجابي' : nodeData.emotion === 'negative' ? 'سلبي' : 'محايد'}
              </span>
            )}
            
            {nodeData.priority && (
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${nodeData.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                ${nodeData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                ${nodeData.priority === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
              `}>
                {nodeData.priority === 'high' ? 'عالية' : nodeData.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons (shown on hover) */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
        <button
          className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          title="توسيع بالذكاء الاصطناعي"
          onClick={(e) => {
            e.stopPropagation();
            // Handle AI expansion
          }}
        >
          <Sparkles className="w-3 h-3" />
        </button>
        
        <button
          className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          title="إضافة عقدة فرعية"
          onClick={(e) => {
            e.stopPropagation();
            // Handle add child node
          }}
        >
          <Plus className="w-3 h-3" />
        </button>
        
        <button
          className="w-6 h-6 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          title="تحرير"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit className="w-3 h-3" />
        </button>
        
        <button
          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          title="حذف"
          onClick={(e) => {
            e.stopPropagation();
            // Handle delete node
          }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Progress indicator for tasks */}
      {nodeData.type === 'task' && (
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: '0%' }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomNode;