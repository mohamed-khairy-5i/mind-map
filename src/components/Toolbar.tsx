import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: () => void;
  onExport: () => void;
  onImport: () => void;
  onShare: () => void;
  onExpandNode?: () => void;
  isGenerating: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onExport,
  onImport,
  onShare,
  onExpandNode,
  isGenerating
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toolbarItems = [
    {
      id: 'add',
      icon: Plus,
      label: 'إضافة عقدة',
      onClick: onAddNode,
      primary: true
    },
    {
      id: 'expand',
      icon: Sparkles,
      label: 'توسيع بالذكاء الاصطناعي',
      onClick: onExpandNode,
      disabled: !onExpandNode || isGenerating,
      loading: isGenerating
    },
    {
      id: 'divider1',
      type: 'divider'
    },
    {
      id: 'save',
      icon: Save,
      label: 'حفظ',
      onClick: () => {/* Handle save */}
    },
    {
      id: 'export',
      icon: Download,
      label: 'تصدير',
      onClick: onExport
    },
    {
      id: 'import',
      icon: Upload,
      label: 'استيراد',
      onClick: onImport
    },
    {
      id: 'share',
      icon: Share2,
      label: 'مشاركة',
      onClick: onShare
    },
    {
      id: 'divider2',
      type: 'divider'
    },
    {
      id: 'undo',
      icon: Undo,
      label: 'تراجع',
      onClick: () => {/* Handle undo */}
    },
    {
      id: 'redo',
      icon: Redo,
      label: 'إعادة',
      onClick: () => {/* Handle redo */}
    },
    {
      id: 'divider3',
      type: 'divider'
    },
    {
      id: 'zoom-in',
      icon: ZoomIn,
      label: 'تكبير',
      onClick: () => {/* Handle zoom in */}
    },
    {
      id: 'zoom-out',
      icon: ZoomOut,
      label: 'تصغير',
      onClick: () => {/* Handle zoom out */}
    },
    {
      id: 'fit-view',
      icon: Maximize,
      label: 'ملء الشاشة',
      onClick: () => {/* Handle fit view */}
    },
    {
      id: 'divider4',
      type: 'divider'
    },
    {
      id: 'grid',
      icon: Grid,
      label: 'شبكة',
      onClick: () => {/* Toggle grid */}
    },
    {
      id: 'colors',
      icon: Palette,
      label: 'ألوان',
      onClick: () => setShowColorPicker(!showColorPicker)
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'إعدادات',
      onClick: () => {/* Handle settings */}
    }
  ];

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-2 border border-white/20 dark:border-gray-700/50 shadow-xl">
      <div className="flex items-center space-x-1">
        {toolbarItems.map((item) => {
          if (item.type === 'divider') {
            return (
              <div
                key={item.id}
                className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
              />
            );
          }

          const Icon = item.icon!;
          const isDisabled = item.disabled;
          const isLoading = item.loading;

          return (
            <div key={item.id} className="relative">
              <button
                onClick={item.onClick}
                disabled={isDisabled}
                className={`
                  relative p-2 rounded-lg transition-all duration-200 group
                  ${item.primary
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:scale-105'
                    : isDisabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }
                `}
                title={item.label}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-200" />
                </div>
              </button>

              {/* Color Picker Dropdown */}
              {item.id === 'colors' && showColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[200px]">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اختر لون المظهر
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Handle color change
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors duration-200 hover:scale-110 transform"
                        style={{ backgroundColor: color }}
                        title={`لون ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Input */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      لون مخصص
                    </label>
                    <input
                      type="color"
                      className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                      onChange={() => {
                        // Handle custom color
                        setShowColorPicker(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>اختصارات: Ctrl+N (جديد), Ctrl+S (حفظ), Del (حذف)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;