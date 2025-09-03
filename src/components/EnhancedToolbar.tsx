import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Share2, 
  Sparkles, 
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Palette,
  Settings,
  Search,
  Filter,
  Layout,
  Camera,
  Copy,
  Scissors,
  FileText,
  Image as ImageIcon,
  Mic,
  Video,
  Globe,
  Lock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Layers,
  Move3D,
  RotateCw,
  Magnet,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  X
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onExport: () => void;
  onImport: () => void;
  onShare: () => void;
  onExpandNode?: () => void;
  isGenerating: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  selectedNodes?: number;
}

interface ToolbarGroup {
  id: string;
  title: string;
  items: ToolbarItem[];
  collapsible?: boolean;
}

interface ToolbarItem {
  id: string;
  icon: any;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  primary?: boolean;
  danger?: boolean;
  dropdown?: DropdownItem[];
}

interface DropdownItem {
  id: string;
  label: string;
  icon?: any;
  onClick: () => void;
  shortcut?: string;
}

const colors = [
  { name: 'Neural Blue', value: '#667eea' },
  { name: 'Purple Glow', value: '#764ba2' },
  { name: 'Pink Fusion', value: '#f093fb' },
  { name: 'Ocean Breeze', value: '#4facfe' },
  { name: 'Emerald Green', value: '#43e97b' },
  { name: 'Sunset Orange', value: '#ffeaa7' },
  { name: 'Ruby Red', value: '#f5576c' },
  { name: 'Arctic Blue', value: '#00f2fe' },
];

const layouts = [
  { id: 'radial', name: 'شعاعي', icon: Move3D },
  { id: 'hierarchical', name: 'هرمي', icon: Layers },
  { id: 'organic', name: 'عضوي', icon: RotateCw },
  { id: 'grid', name: 'شبكة', icon: Grid },
];

export default function EnhancedToolbar({
  onAddNode,
  onExport,
  onImport,
  onShare,
  onExpandNode,
  isGenerating,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  selectedNodes = 0
}: ToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(colors[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportOptions: DropdownItem[] = [
    { id: 'png', label: 'صورة PNG', icon: ImageIcon, onClick: () => onExport(), shortcut: 'Ctrl+E' },
    { id: 'pdf', label: 'ملف PDF', icon: FileText, onClick: () => onExport() },
    { id: 'svg', label: 'رسم SVG', icon: ImageIcon, onClick: () => onExport() },
    { id: 'json', label: 'بيانات JSON', icon: FileText, onClick: () => onExport() },
  ];

  const importOptions: DropdownItem[] = [
    { id: 'file', label: 'من ملف', icon: Upload, onClick: onImport },
    { id: 'text', label: 'من نص', icon: FileText, onClick: () => console.log('Import from text') },
    { id: 'image', label: 'من صورة', icon: ImageIcon, onClick: () => console.log('Import from image') },
    { id: 'audio', label: 'من صوت', icon: Mic, onClick: () => console.log('Import from audio') },
    { id: 'video', label: 'من فيديو', icon: Video, onClick: () => console.log('Import from video') },
  ];

  const shareOptions: DropdownItem[] = [
    { id: 'public', label: 'رابط عام', icon: Globe, onClick: onShare },
    { id: 'private', label: 'رابط خاص', icon: Lock, onClick: onShare },
    { id: 'embed', label: 'كود التضمين', icon: Copy, onClick: onShare },
    { id: 'social', label: 'مشاركة اجتماعية', icon: Share2, onClick: onShare },
  ];

  const toolbarGroups: ToolbarGroup[] = [
    {
      id: 'create',
      title: 'إنشاء',
      items: [
        {
          id: 'add-node',
          icon: Plus,
          label: 'عقدة جديدة',
          onClick: onAddNode,
          primary: true
        },
        {
          id: 'ai-expand',
          icon: Sparkles,
          label: 'توسيع ذكي',
          onClick: onExpandNode,
          disabled: !onExpandNode || isGenerating,
          loading: isGenerating
        }
      ]
    },
    {
      id: 'file',
      title: 'ملف',
      items: [
        {
          id: 'save',
          icon: Save,
          label: 'حفظ',
          onClick: () => console.log('Save')
        },
        {
          id: 'export',
          icon: Download,
          label: 'تصدير',
          dropdown: exportOptions
        },
        {
          id: 'import',
          icon: Upload,
          label: 'استيراد',
          dropdown: importOptions
        },
        {
          id: 'share',
          icon: Share2,
          label: 'مشاركة',
          dropdown: shareOptions
        }
      ]
    },
    {
      id: 'edit',
      title: 'تحرير',
      items: [
        {
          id: 'undo',
          icon: Undo,
          label: 'تراجع',
          onClick: onUndo,
          disabled: !canUndo
        },
        {
          id: 'redo',
          icon: Redo,
          label: 'إعادة',
          onClick: onRedo,
          disabled: !canRedo
        },
        {
          id: 'copy',
          icon: Copy,
          label: 'نسخ',
          onClick: () => console.log('Copy'),
          disabled: selectedNodes === 0
        },
        {
          id: 'cut',
          icon: Scissors,
          label: 'قص',
          onClick: () => console.log('Cut'),
          disabled: selectedNodes === 0
        }
      ]
    },
    {
      id: 'view',
      title: 'عرض',
      items: [
        {
          id: 'zoom-in',
          icon: ZoomIn,
          label: 'تكبير',
          onClick: onZoomIn
        },
        {
          id: 'zoom-out',
          icon: ZoomOut,
          label: 'تصغير',
          onClick: onZoomOut
        },
        {
          id: 'fit-view',
          icon: Maximize,
          label: 'ملء الشاشة',
          onClick: onFitView
        },
        {
          id: 'screenshot',
          icon: Camera,
          label: 'لقطة شاشة',
          onClick: () => console.log('Screenshot')
        }
      ]
    },
    {
      id: 'design',
      title: 'تصميم',
      collapsible: true,
      items: [
        {
          id: 'theme',
          icon: Palette,
          label: 'الألوان',
          onClick: () => setShowColorPicker(!showColorPicker)
        },
        {
          id: 'layout',
          icon: Layout,
          label: 'التخطيط',
          onClick: () => console.log('Layout')
        },
        {
          id: 'grid',
          icon: Grid,
          label: 'الشبكة',
          onClick: () => console.log('Toggle grid')
        },
        {
          id: 'align',
          icon: AlignCenter,
          label: 'محاذاة',
          onClick: () => console.log('Align')
        }
      ]
    }
  ];

  const toggleGroupCollapse = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleDropdownClick = (itemId: string) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  return (
    <div className="glass-panel p-3 shadow-lift max-w-5xl" ref={dropdownRef}>
      
      {/* Search and Quick Actions */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في الأدوات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-neural pl-10 pr-4 py-2 w-64 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="glass-button p-2" title="مرشح">
              <Filter className="w-4 h-4" />
            </button>
            <button className="glass-button p-2" title="إعدادات">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>العقد المحددة: {selectedNodes}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>متصل</span>
          </div>
        </div>
      </div>

      {/* Toolbar Groups */}
      <div className="space-y-3">
        {toolbarGroups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.id);
          const filteredItems = group.items.filter(item => 
            !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0 && searchQuery) return null;

          return (
            <div key={group.id} className="group">
              
              {/* Group Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  {group.title}
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {filteredItems.length}
                  </span>
                </h3>
                
                {group.collapsible && (
                  <button
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  >
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} 
                    />
                  </button>
                )}
              </div>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="flex flex-wrap gap-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const hasDropdown = item.dropdown && item.dropdown.length > 0;
                    const isDropdownOpen = activeDropdown === item.id;

                    return (
                      <div key={item.id} className="relative">
                        <button
                          onClick={hasDropdown ? () => handleDropdownClick(item.id) : item.onClick}
                          disabled={item.disabled}
                          className={`
                            relative p-2.5 rounded-lg transition-all duration-200 group/item flex items-center gap-2
                            ${item.primary
                              ? 'btn-neural text-sm'
                              : item.danger
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                              : item.disabled
                              ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                              : 'glass-button hover:scale-105'
                            }
                            ${isDropdownOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
                          `}
                          title={item.label}
                        >
                          {item.loading ? (
                            <div className="spinner-neural" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                          
                          {hasDropdown && (
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          )}

                          {/* Badge for notifications */}
                          {item.id === 'save' && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}

                          {/* Tooltip */}
                          <div className="tooltip-neural absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        </button>

                        {/* Dropdown Menu */}
                        {hasDropdown && isDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 glass-panel p-1 min-w-[200px] z-50 animate-scale-in">
                            {item.dropdown!.map((dropdownItem) => {
                              const DropdownIcon = dropdownItem.icon;
                              return (
                                <button
                                  key={dropdownItem.id}
                                  onClick={() => {
                                    dropdownItem.onClick();
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                  {DropdownIcon && <DropdownIcon className="w-4 h-4" />}
                                  <span className="flex-1 text-right">{dropdownItem.label}</span>
                                  {dropdownItem.shortcut && (
                                    <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">
                                      {dropdownItem.shortcut}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Color Theme Picker */}
      {showColorPicker && (
        <div className="absolute top-full left-0 mt-2 glass-panel p-4 min-w-[300px] z-50 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-700 dark:text-slate-300">اختيار المظهر</h3>
            <button
              onClick={() => setShowColorPicker(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentTheme(color);
                  setShowColorPicker(false);
                }}
                className={`
                  group relative w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110
                  ${currentTheme.value === color.value 
                    ? 'border-slate-400 dark:border-slate-300 shadow-lg' 
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {currentTheme.value === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Layout Options */}
          <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">تخطيط الخريطة</h4>
            <div className="grid grid-cols-2 gap-2">
              {layouts.map((layout) => {
                const LayoutIcon = layout.icon;
                return (
                  <button
                    key={layout.id}
                    onClick={() => console.log(`Apply ${layout.id} layout`)}
                    className="flex items-center gap-2 p-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <LayoutIcon className="w-4 h-4" />
                    <span>{layout.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>اختصارات: Space (إضافة), Del (حذف), Ctrl+Z (تراجع)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              المظهر: {currentTheme.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}