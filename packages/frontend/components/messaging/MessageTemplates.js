import { useState } from 'react';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { messageTemplates } from '../../lib/dummyData';

export default function MessageTemplates({ onSelectTemplate }) {
  const [templates, setTemplates] = useState(messageTemplates);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: ''
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim() && newTemplate.content.trim()) {
      const template = {
        id: Date.now(),
        name: newTemplate.name,
        content: newTemplate.content
      };
      setTemplates([...templates, template]);
      setNewTemplate({ name: '', content: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content
    });
    setShowCreateModal(true);
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && newTemplate.name.trim() && newTemplate.content.trim()) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, name: newTemplate.name, content: newTemplate.content }
          : t
      ));
      setEditingTemplate(null);
      setNewTemplate({ name: '', content: '' });
      setShowCreateModal(false);
    }
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleUseTemplate = (template) => {
    onSelectTemplate && onSelectTemplate(template.content);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', content: '' });
  };

  return (
    <div className="bg-white rounded-lg border border-secondary-200">
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-secondary-900">Message Templates</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-secondary-900 text-sm">
                {template.name}
              </h4>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="p-1 text-secondary-400 hover:text-primary-600"
                  title="Use template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-1 text-secondary-400 hover:text-blue-600"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-secondary-400 hover:text-red-600"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-secondary-600 line-clamp-2">
              {template.content}
            </p>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-secondary-500 mb-4">
              No templates yet. Create your first template to save time.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModal}
        title={editingTemplate ? 'Edit Template' : 'Create New Template'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Template Name</label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="Enter template name"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Template Content</label>
            <textarea
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              placeholder="Enter your message template..."
              rows={6}
              className="form-input"
            />
            <p className="mt-1 text-sm text-secondary-500">
              You can use variables like {'{buyer_name}'}, {'{product_name}'}, {'{quantity}'} in your template.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button 
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
