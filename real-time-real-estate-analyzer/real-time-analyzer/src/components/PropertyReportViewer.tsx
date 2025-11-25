import React, { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { PropertyData } from './PropertyForm';
import { generatePropertyReport, downloadReport, printReport } from '../utils/reportGenerator';
import './PropertyReportViewer.css';

interface PropertyReportViewerProps {
  formData: PropertyData;
  onClose: () => void;
}

const PropertyReportViewer: React.FC<PropertyReportViewerProps> = ({ formData, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadReport = async () => {
      if (iframeRef.current) {
        try {
          setIsLoading(true);
          const html = await generatePropertyReport(formData);
          if (isMounted && iframeRef.current) {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframeRef.current.src = url;
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error generating report:', error);
          if (isMounted) {
            setIsLoading(false);
            alert('Failed to generate report. Please make sure the backend server is running.');
          }
        }
      }
    };

    loadReport();

    return () => {
      isMounted = false;
      if (iframeRef.current?.src) {
        URL.revokeObjectURL(iframeRef.current.src);
      }
    };
  }, [formData]);

  const handleDownload = async () => {
    try {
      await downloadReport(formData);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please make sure the backend server is running.');
    }
  };

  const handlePrint = async () => {
    try {
      await printReport(formData);
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Failed to print report. Please make sure the backend server is running.');
    }
  };

  return (
    <div className="report-viewer-overlay">
      <div className="report-viewer-container">
        <div className="report-viewer-header">
          <h2>Property Investment Analysis Report</h2>
          <div className="report-viewer-actions">
            <button onClick={handleDownload} className="btn-icon" title="Download Report">
              <FiDownload />
            </button>
            <button onClick={handlePrint} className="btn-icon" title="Print Report">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button onClick={onClose} className="btn-icon" title="Close">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="report-viewer-content">
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div>Loading report...</div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Property Report"
            className="report-iframe"
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyReportViewer;

