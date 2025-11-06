import { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader,
  Package,
  Eye,
  Trash2,
  Edit,
  Copy
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { parseCSV, generateCSVTemplate, exportProductsToCSV } from '../../lib/csvUtils';

export default function BulkOperations({ 
  onBulkImport, 
  onBulkExport, 
  selectedProducts = [],
  allProducts = [],
  isOpen, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('import');
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setImportFile(file);
    setValidationErrors([]);
    
    try {
      const csvText = await file.text();
      const parsedData = parseCSV(csvText);
      
      // Validate data
      const errors = validateImportData(parsedData);
      setValidationErrors(errors);
      
      // Show preview of first 5 rows
      setPreviewData(parsedData.slice(0, 5));
      
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error reading CSV file. Please check the format.');
    }
  };

  const validateImportData = (data) => {
    const errors = [];
    const requiredFields = ['name', 'price', 'moq', 'category'];
    
    if (data.length === 0) {
      errors.push('CSV file is empty');
      return errors;
    }

    // Check headers
    const headers = Object.keys(data[0] || {});
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we have header row
      
      if (!row.name?.trim()) {
        errors.push(`Row ${rowNumber}: Product name is required`);
      }
      
      if (!row.price || isNaN(parseFloat(row.price))) {
        errors.push(`Row ${rowNumber}: Valid price is required`);
      }
      
      if (!row.moq || isNaN(parseInt(row.moq))) {
        errors.push(`Row ${rowNumber}: Valid MOQ (Minimum Order Quantity) is required`);
      }
      
      if (!row.category?.trim()) {
        errors.push(`Row ${rowNumber}: Category is required`);
      }

      // Validate HS Code if provided
      if (row.hs_code && !/^\d{4,10}$/.test(row.hs_code.replace(/\./g, ''))) {
        errors.push(`Row ${rowNumber}: HS Code must be 4-10 digits`);
      }
    });

    return errors;
  };

  const handleBulkImport = async () => {
    if (!importFile || validationErrors.length > 0) return;
    
    setImportProgress(0);
    
    try {
      const csvText = await importFile.text();
      const data = parseCSV(csvText);
      
      const results = {
        total: data.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        try {
          await onBulkImport(batch);
          results.success += batch.length;
        } catch (error) {
          console.error('Batch import error:', error);
          results.failed += batch.length;
          results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        }
        
        setImportProgress(Math.round(((i + batch.length) / data.length) * 100));
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportResults(results);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        total: 0,
        success: 0,
        failed: 0,
        errors: [error.message]
      });
    } finally {
      setImportProgress(null);
    }
  };

  const handleBulkExport = async (format = 'csv') => {
    try {
      const productsToExport = selectedProducts.length > 0 ? selectedProducts : allProducts;
      
      if (format === 'csv') {
        await exportProductsToCSV(productsToExport);
      }
      
      // You can add other formats like Excel, JSON here
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting products. Please try again.');
    }
  };

  const downloadTemplate = () => {
    generateCSVTemplate();
  };

  const resetImport = () => {
    setImportFile(null);
    setImportProgress(null);
    setImportResults(null);
    setValidationErrors([]);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Operations" size="large">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'import', label: 'Bulk Import', icon: Upload },
              { id: 'export', label: 'Bulk Export', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How to Import Products</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Download the CSV template with required columns</li>
                <li>Fill in your product data (name, price, moq, category are required)</li>
                <li>Upload the completed CSV file</li>
                <li>Review the preview and fix any validation errors</li>
                <li>Click "Import Products" to add them to your catalog</li>
              </ol>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">CSV Template</p>
                  <p className="text-sm text-gray-600">Download template with required columns</p>
                </div>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* File Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {importFile ? importFile.name : 'Choose CSV file to upload'}
                </p>
                <p className="text-gray-600">
                  {importFile ? 'Click to select a different file' : 'Click to browse or drag and drop your CSV file here'}
                </p>
              </div>
            </div>

            {/* Validation Results */}
            {importFile && (
              <div className="space-y-4">
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-medium text-red-900">Validation Errors</h3>
                    </div>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {validationErrors.length > 10 && (
                        <li className="text-red-600 font-medium">
                          ... and {validationErrors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {validationErrors.length === 0 && previewData.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-green-900">Validation Passed</h3>
                    </div>
                    <p className="text-sm text-green-800">
                      {previewData.length} products ready for import. Preview of first 5 rows:
                    </p>
                    
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-green-100">
                            {Object.keys(previewData[0] || {}).slice(0, 6).map(key => (
                              <th key={key} className="px-2 py-1 text-left font-medium text-green-900">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b border-green-200">
                              {Object.values(row).slice(0, 6).map((value, i) => (
                                <td key={i} className="px-2 py-1 text-green-800">
                                  {String(value).substring(0, 20)}
                                  {String(value).length > 20 && '...'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Progress */}
            {importProgress !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <h3 className="font-medium text-blue-900">Importing Products</h3>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-800 mt-2">{importProgress}% complete</p>
              </div>
            )}

            {/* Import Results */}
            {importResults && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Import Results</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{importResults.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                    <div className="text-sm text-gray-600">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
                
                {importResults.errors.length > 0 && (
                  <div className="text-sm text-red-600">
                    <p className="font-medium mb-1">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Import Actions */}
            <div className="flex space-x-3">
              <Button
                onClick={handleBulkImport}
                disabled={!importFile || validationErrors.length > 0 || importProgress !== null}
                className="flex-1"
              >
                {importProgress !== null ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Products
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={resetImport}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-2">Export Your Products</h3>
              <p className="text-sm text-green-800">
                Export your product catalog for backup, analysis, or sharing with partners.
                You can export all products or just selected ones.
              </p>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedProducts.length > 0 ? `${selectedProducts.length} Selected Products` : `All Products (${allProducts.length})`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedProducts.length > 0 
                        ? 'Export only the products you have selected' 
                        : 'Export your complete product catalog'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant={selectedProducts.length > 0 ? 'primary' : 'secondary'}>
                  {selectedProducts.length > 0 ? selectedProducts.length : allProducts.length} items
                </Badge>
              </div>

              {/* Export Formats */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">CSV Format</p>
                      <p className="text-sm text-gray-600">Compatible with Excel, Google Sheets, and most systems</p>
                    </div>
                  </div>
                  <Button onClick={() => handleBulkExport('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>

                {/* You can add more export formats here */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Excel Format</p>
                      <p className="text-sm text-gray-600">Advanced formatting with multiple sheets (Coming Soon)</p>
                    </div>
                  </div>
                  <Button disabled variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>

            {/* Export Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900">Export Tips</h3>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1 list-disc list-inside">
                    <li>Exported files include all product details, specifications, and metadata</li>
                    <li>Images and videos are referenced by filename - files need to be backed up separately</li>
                    <li>Large catalogs may take a few moments to process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
