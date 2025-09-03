import { type Node, type Edge } from '@xyflow/react';

export interface MindMapExport {
  title: string;
  description: string;
  createdAt: string;
  version: string;
  nodes: Node[];
  edges: Edge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    nodeTypes: Record<string, number>;
  };
}

// Export mind map to JSON file
export function exportMindMap(
  nodes: Node[], 
  edges: Edge[], 
  filename: string = 'mindforge-map'
): void {
  try {
    // Prepare export data
    const exportData: MindMapExport = {
      title: filename,
      description: 'خريطة ذهنية مُنشأة بواسطة MindForge',
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: getNodeTypesCount(nodes)
      }
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.mindforge`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('تم تصدير الخريطة الذهنية بنجاح');
  } catch (error) {
    console.error('خطأ في تصدير الخريطة الذهنية:', error);
    throw new Error('فشل في تصدير الخريطة الذهنية');
  }
}

// Import mind map from JSON file
export async function importMindMap(
  file: File,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
): Promise<void> {
  try {
    if (!file) {
      throw new Error('لم يتم اختيار ملف');
    }

    // Validate file type
    if (!file.name.endsWith('.mindforge') && !file.name.endsWith('.json')) {
      throw new Error('نوع الملف غير مدعوم. يُرجى اختيار ملف .mindforge أو .json');
    }

    // Read file content
    const fileContent = await readFileAsText(file);
    
    // Parse JSON
    const importData: MindMapExport = JSON.parse(fileContent);
    
    // Validate structure
    validateImportData(importData);
    
    // Apply imported data
    setNodes(importData.nodes || []);
    setEdges(importData.edges || []);
    
    console.log('تم استيراد الخريطة الذهنية بنجاح:', importData.title);
  } catch (error) {
    console.error('خطأ في استيراد الخريطة الذهنية:', error);
    throw new Error(`فشل في استيراد الخريطة الذهنية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  }
}

// Export as PNG image
export async function exportAsPNG(
  filename: string = 'mindforge-map'
): Promise<void> {
  try {
    // Get React Flow viewport element
    const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (!reactFlowElement) {
      throw new Error('لم يتم العثور على عنصر الخريطة الذهنية');
    }

    // Use html2canvas to capture the element
    const { default: html2canvas } = await import('html2canvas');
    
    const canvas = await html2canvas(reactFlowElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

    console.log('تم تصدير الخريطة كصورة بنجاح');
  } catch (error) {
    console.error('خطأ في تصدير الصورة:', error);
    throw new Error('فشل في تصدير الخريطة كصورة');
  }
}

// Export as PDF
export async function exportAsPDF(
  filename: string = 'mindforge-map'
): Promise<void> {
  try {
    // Use jsPDF
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    
    const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (!reactFlowElement) {
      throw new Error('لم يتم العثور على عنصر الخريطة الذهنية');
    }

    // Capture as canvas
    const canvas = await html2canvas(reactFlowElement, {
      backgroundColor: '#ffffff',
      scale: 1.5,
      logging: false,
      useCORS: true
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit
    const canvasAspectRatio = canvas.height / canvas.width;
    const pdfAspectRatio = pdfHeight / pdfWidth;
    
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth * canvasAspectRatio;
    
    if (canvasAspectRatio > pdfAspectRatio) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight / canvasAspectRatio;
    }
    
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(filename, 20, 20);
    
    // Add creation date
    pdf.setFontSize(10);
    pdf.text(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}`, 20, 30);
    
    pdf.save(`${filename}.pdf`);

    console.log('تم تصدير الخريطة كـ PDF بنجاح');
  } catch (error) {
    console.error('خطأ في تصدير PDF:', error);
    throw new Error('فشل في تصدير الخريطة كـ PDF');
  }
}

// Export as SVG
export function exportAsSVG(
  nodes: Node[],
  edges: Edge[],
  filename: string = 'mindforge-map'
): void {
  try {
    // Create SVG content
    const svgContent = generateSVGContent(nodes, edges);
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('تم تصدير الخريطة كـ SVG بنجاح');
  } catch (error) {
    console.error('خطأ في تصدير SVG:', error);
    throw new Error('فشل في تصدير الخريطة كـ SVG');
  }
}

// Helper functions
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('فشل في قراءة الملف'));
      }
    };
    reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
    reader.readAsText(file);
  });
}

function validateImportData(data: any): void {
  if (!data || typeof data !== 'object') {
    throw new Error('بيانات الملف غير صحيحة');
  }

  if (!Array.isArray(data.nodes)) {
    throw new Error('بيانات العقد مفقودة أو غير صحيحة');
  }

  if (!Array.isArray(data.edges)) {
    throw new Error('بيانات الروابط مفقودة أو غير صحيحة');
  }

  // Validate nodes structure
  for (const node of data.nodes) {
    if (!node.id || !node.data || !node.position) {
      throw new Error('هيكل العقدة غير صحيح');
    }
  }

  // Validate edges structure
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) {
      throw new Error('هيكل الرابط غير صحيح');
    }
  }
}

function getNodeTypesCount(nodes: Node[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  nodes.forEach(node => {
    const type = (node.data as any)?.type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  });
  
  return counts;
}

function generateSVGContent(nodes: Node[], edges: Edge[]): string {
  const width = 1200;
  const height = 800;
  
  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .node-text { font-family: Arial, sans-serif; font-size: 14px; fill: #374151; }
          .node-desc { font-family: Arial, sans-serif; font-size: 12px; fill: #6b7280; }
          .edge { stroke: #9ca3af; stroke-width: 2; fill: none; }
        </style>
      </defs>
      <rect width="100%" height="100%" fill="#f9fafb"/>
  `;

  // Add edges
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      svgContent += `
        <line 
          x1="${sourceNode.position.x + 100}" 
          y1="${sourceNode.position.y + 50}" 
          x2="${targetNode.position.x + 100}" 
          y2="${targetNode.position.y + 50}" 
          class="edge"
        />
      `;
    }
  });

  // Add nodes
  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    const color = (node.data as any)?.color || '#3b82f6';
    
    svgContent += `
      <g transform="translate(${x}, ${y})">
        <rect width="200" height="80" rx="12" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="2"/>
        <text x="10" y="25" class="node-text">${(node.data as any)?.emoji || '•'} ${(node.data as any)?.label || 'عقدة'}</text>
        <text x="10" y="45" class="node-desc">${(node.data as any)?.description || ''}</text>
      </g>
    `;
  });

  svgContent += '</svg>';
  
  return svgContent;
}

// Auto-save functionality
export function setupAutoSave(
  getNodes: () => Node[],
  getEdges: () => Edge[]
): () => void {
  const AUTOSAVE_KEY = 'mindforge-autosave';
  const AUTOSAVE_INTERVAL = 30000; // 30 seconds

  const save = () => {
    try {
      const data = {
        nodes: getNodes(),
        edges: getEdges(),
        timestamp: Date.now()
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      console.log('تم الحفظ التلقائي');
    } catch (error) {
      console.error('خطأ في الحفظ التلقائي:', error);
    }
  };

  const intervalId = setInterval(save, AUTOSAVE_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

// Load autosaved data
export function loadAutoSave(): { nodes: Node[], edges: Edge[] } | null {
  try {
    const AUTOSAVE_KEY = 'mindforge-autosave';
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    
    if (saved) {
      const data = JSON.parse(saved);
      
      // Check if data is recent (less than 24 hours old)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - data.timestamp < maxAge) {
        return {
          nodes: data.nodes || [],
          edges: data.edges || []
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('خطأ في تحميل البيانات المحفوظة:', error);
    return null;
  }
}