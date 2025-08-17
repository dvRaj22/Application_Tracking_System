import React, { useRef, useState } from 'react';
import { Download, FileText, Image } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AnalyticsExport = ({ analyticsData, timeRange, exportRef }) => {
  const [isExporting, setIsExporting] = useState(false);

  const getExportFileName = (extension) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const timeStr = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
    return `ATS-Analytics-${timeStr}-${timestamp}.${extension}`;
  };

  const exportAsPNG = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      });
      
      const link = document.createElement('a');
      link.download = getExportFileName('png');
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export as PNG:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(`ATS Analytics Report - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`, 20, 20);
      
      // Add timestamp
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add the chart image
      pdf.addImage(imgData, 'PNG', 20, 40, imgWidth - 40, imgHeight - 40);
      
      pdf.save(getExportFileName('pdf'));
    } catch (error) {
      console.error('Failed to export as PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={exportAsPNG}
        disabled={isExporting}
        className="btn-secondary inline-flex items-center px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PNG"
      >
        <Image className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export PNG'}
      </button>
      
      <button
        onClick={exportAsPDF}
        disabled={isExporting}
        className="btn-secondary inline-flex items-center px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PDF"
      >
        <FileText className="w-4 h-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
};

export default AnalyticsExport;
