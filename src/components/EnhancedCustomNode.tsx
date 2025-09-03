import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Target,
  Clock,
  Tag,
  MoreHorizontal,
  Copy,
  Link,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  Circle,
  AlertCircle,
  MessageSquare,
  Bookmark,
  Zap,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

interface EnhancedNodeData {
  label: string;
  type: 'central' | 'category' | 'idea' | 'task' | 'note' | 'question';
  description?: string;
  emoji?: string;
  color?: string;
  emotion?: 'positive' | 'negative' | 'neutral';
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  metadata?: {
    confidence?: number;
    relevance?: number;
    actionable?: boolean;
    completed?: boolean;
    progress?: number;
    dueDate?: string;
    assignee?: string;
    createdAt?: string;
    lastModified?: string;
  };
  aiGenerated?: boolean;
  collapsed?: boolean;
}

const EnhancedCustomNode: React.FC<NodeProps> = ({ 
  data, 
  selected,
  id,
  type
}) => {
  const nodeData = data as unknown as EnhancedNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(nodeData.label);
  const [description, setDescription] = useState(nodeData.description || '');
  const [showTooltip, setShowTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!nodeData.collapsed);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSubmit = useCallback(() => {
    // Here you would typically update the node data through a context or callback
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabel(nodeData.label);
    }
  }, [handleSubmit, nodeData.label]);

  const getNodeIcon = () => {
    switch (nodeData.type) {
      case 'central': return Brain;
      case 'category': return Lightbulb;
      case 'idea': return Star;
      case 'task': return CheckCircle;
      case 'note': return FileText;
      case 'question': return MessageSquare;
      default: return Circle;
    }
  };

  const getNodeStyle = () => {
    const baseStyle = 'mindmap-node';
    const typeStyle = `mindmap-node ${nodeData.type}`;
    const selectedStyle = selected ? 'ring-2 ring-blue-400 ring-opacity-75' : '';
    const emotionStyle = nodeData.emotion === 'positive' 
      ? 'border-green-200 dark:border-green-700' 
      : nodeData.emotion === 'negative' 
      ? 'border-red-200 dark:border-red-700' 
      : 'border-slate-200 dark:border-slate-700';
    
    return `${baseStyle} ${typeStyle} ${selectedStyle} ${emotionStyle}`;
  };

  const getPriorityColor = () => {
    switch (nodeData.priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-400';
    }
  };

  const getProgress = () => {
    return nodeData.metadata?.progress || 0;
  };

  const isCompleted = () => {
    return nodeData.metadata?.completed || false;
  };

  const NodeIcon = getNodeIcon();

  return (
    <div 
      ref={nodeRef}
      className={`${getNodeStyle()} relative group transition-all duration-300 ${
        nodeData.type === 'central' ? 'min-w-[200px]' : 'min-w-[150px]'
      } ${!isExpanded ? 'opacity-60 scale-90' : ''}`}
      onMouseEnter={() => {
        setShowTooltip(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        setShowActions(false);
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        backgroundColor: nodeData.color ? `${nodeData.color}15` : undefined,
        borderColor: nodeData.color || undefined,
      }}
    >
      {/* Handles for connections */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-800"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-800"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-800"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white dark:!border-slate-800"
      />

      {/* AI Generated Badge */}
      {nodeData.aiGenerated && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse-glow">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Priority Indicator */}
      {nodeData.priority && nodeData.type === 'task' && (
        <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${getPriorityColor()}`}>
          <Flag className="w-3 h-3 fill-current" />
        </div>
      )}

      {/* Completion Status */}
      {nodeData.type === 'task' && (
        <div className="absolute top-2 right-2">
          {isCompleted() ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-400" />
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          {/* Icon/Emoji */}
          <div className="flex-shrink-0">
            {nodeData.emoji ? (
              <span className="text-lg">{nodeData.emoji}</span>
            ) : (
              <NodeIcon 
                className={`w-5 h-5 ${
                  nodeData.type === 'central' ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                }`} 
                style={{ color: nodeData.color }}
              />
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
              />
            ) : (
              <h3 
                className={`text-sm font-semibold ${
                  nodeData.type === 'central' 
                    ? 'text-white text-base' 
                    : 'text-slate-800 dark:text-slate-200'
                } ${isCompleted() ? 'line-through opacity-60' : ''}`}
                dir="rtl"
              >
                {label}
              </h3>
            )}
          </div>
        </div>

        {/* Description */}
        {isExpanded && description && (
          <p className={`text-xs ${
            nodeData.type === 'central' 
              ? 'text-white/80' 
              : 'text-slate-600 dark:text-slate-400'
          } mb-2 leading-relaxed`} dir="rtl">
            {description}
          </p>
        )}

        {/* Progress Bar for Tasks */}
        {isExpanded && nodeData.type === 'task' && getProgress() > 0 && (
          <div className="mb-2">
            <div className="progress-neural">
              <div 
                className="progress-neural-bar"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-right">
              {getProgress()}% مكتمل
            </div>
          </div>
        )}

        {/* Tags */}
        {isExpanded && nodeData.tags && nodeData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {nodeData.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
            {nodeData.tags.length > 3 && (
              <span className="text-xs text-slate-500">+{nodeData.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Metadata */}
        {isExpanded && nodeData.metadata && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {nodeData.metadata.confidence && (
              <div className="flex items-center gap-1" title="مستوى الثقة">
                <TrendingUp className="w-3 h-3" />
                <span>{Math.round(nodeData.metadata.confidence * 100)}%</span>
              </div>
            )}
            {nodeData.metadata.assignee && (
              <div className="flex items-center gap-1" title="المسؤول">
                <Users className="w-3 h-3" />
                <span>{nodeData.metadata.assignee}</span>
              </div>
            )}
            {nodeData.metadata.dueDate && (
              <div className="flex items-center gap-1" title="تاريخ الاستحقاق">
                <Clock className="w-3 h-3" />
                <span>{new Date(nodeData.metadata.dueDate).toLocaleDateString('ar')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && !isEditing && (
        <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 animate-fade-in">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="glass-button p-1 hover:scale-110"
            title={isExpanded ? "طي" : "توسيع"}
          >
            {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          
          <button
            onClick={handleDoubleClick}
            className="glass-button p-1 hover:scale-110"
            title="تحرير"
          >
            <Edit className="w-3 h-3" />
          </button>

          <button
            className="glass-button p-1 hover:scale-110"
            title="توسيع بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3 h-3" />
          </button>

          <div className="relative group/more">
            <button
              className="glass-button p-1 hover:scale-110"
              title="المزيد"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-1 glass-panel p-2 min-w-[120px] opacity-0 group-hover/more:opacity-100 transition-all duration-200 z-50 pointer-events-none group-hover/more:pointer-events-auto">
              <button className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                <Copy className="w-3 h-3" />
                نسخ
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                <Link className="w-3 h-3" />
                ربط
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                <Bookmark className="w-3 h-3" />
                حفظ
              </button>
              <hr className="my-1 border-slate-200 dark:border-slate-600" />
              <button className="w-full flex items-center gap-2 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                <Trash2 className="w-3 h-3" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !isEditing && description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 tooltip-neural max-w-xs z-50 animate-fade-in">
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <div className="font-medium mb-1">{label}</div>
            <div className="text-slate-600 dark:text-slate-400">{description}</div>
            {nodeData.tags && nodeData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {nodeData.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-1 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emotion Indicator */}
      {nodeData.emotion && nodeData.emotion !== 'neutral' && (
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
          nodeData.emotion === 'positive' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {nodeData.emotion === 'positive' ? (
            <Heart className="w-2 h-2 fill-current" />
          ) : (
            <AlertCircle className="w-2 h-2 fill-current" />
          )}
        </div>
      )}

      {/* Glow Effect for Selected Node */}
      {selected && (
        <div 
          className="absolute inset-0 rounded-neural animate-pulse-glow pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${nodeData.color || '#667eea'}60`
          }}
        />
      )}
    </div>
  );
};

export default EnhancedCustomNode;