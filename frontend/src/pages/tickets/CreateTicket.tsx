import { CalendarClock, FileText, Tag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import useTicketStore from '../../store/ticketStore';
import { TicketCategory, TicketPriority } from '../../types';

// Form input types
interface CreateTicketFormInputs {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  expectedCompletionDate: string;
}

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket, isLoading, error } = useTicketStore();
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState<CreateTicketFormInputs>({
    title: '',
    description: '',
    category: '' as TicketCategory,
    priority: '' as TicketPriority,
    expectedCompletionDate: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateTicketFormInputs, string>>>({});

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateForm = () => {
    const errors: Partial<Record<keyof CreateTicketFormInputs, string>> = {};
    
    if (!formData.title) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.description) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.priority) {
      errors.priority = 'Priority is required';
    }
    
    if (!formData.expectedCompletionDate) {
      errors.expectedCompletionDate = 'Expected completion date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof CreateTicketFormInputs]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await createTicket(
      formData.title,
      formData.description,
      formData.category,
      formData.priority,
      formData.expectedCompletionDate
    );
    
    if (success) {
      navigate('/tickets');
    }
  };

  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  return (
    <Layout requireAuth allowedRoles={['L1_AGENT']}>
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800">
            Create New Ticket
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new support ticket with the information below. Our support team will respond as soon as possible.
          </p>
        </div>
        
        <div className="px-6 py-5">
          {showError && error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className={`pl-10 py-2 block w-full text-gray-700 bg-white border rounded-md outline-none ring-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the issue"
                />
              </div>
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`block w-full text-gray-700 bg-white border rounded-md outline-none p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  formErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Detailed description of the issue including any error messages or steps to reproduce"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`pl-10 block w-full py-2 text-gray-700 bg-white border rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="ACCESS">Access</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`block w-full py-2 px-3 text-gray-700 bg-white border rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.priority ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {formErrors.priority && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
                )}
              </div>

              <div>
                <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Completion Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="expectedCompletionDate"
                    name="expectedCompletionDate"
                    min={`${minDate}T00:00`}
                    value={formData.expectedCompletionDate}
                    onChange={handleChange}
                    className={`pl-10 block w-full py-2 text-gray-700 bg-white border rounded-md outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.expectedCompletionDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.expectedCompletionDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.expectedCompletionDate}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="mr-4 border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => navigate('/tickets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <span className="flex items-center">
                  Create Ticket
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTicket;