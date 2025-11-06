import { Grid, List } from 'lucide-react';

export default function ViewModeToggle({ 
  viewMode, 
  onViewModeChange, 
  className = '' 
}) {
  return (
    <div className={`inline-flex border border-secondary-300 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 transition-colors ${
          viewMode === 'grid' 
            ? 'bg-primary-100 text-primary-600' 
            : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
        }`}
        title="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 transition-colors ${
          viewMode === 'list' 
            ? 'bg-primary-100 text-primary-600' 
            : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
