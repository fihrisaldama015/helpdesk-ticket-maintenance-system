import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CalendarClock, FileText, TagIcon } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import useTicketStore from '../../store/ticketStore';
import { TicketCategory, TicketPriority } from '../../types';

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
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormInputs>();

  React.useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data: CreateTicketFormInputs) => {
    const success = await createTicket(
      data.title,
      data.description,
      data.category,
      data.priority,
      data.expectedCompletionDate
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New Ticket
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a new support ticket with the information below.
          </p>
        </div>
        
        <div className="px-6 py-5">
          {showError && error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 animate-fadeIn">
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="title"
                  type="text"
                  className={`pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ${
                    errors.title ? 'border-red-300' : ''
                  }`}
                  placeholder="Brief description of the issue"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 5,
                      message: 'Title must be at least 5 characters',
                    },
                  })}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={4}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                  placeholder="Detailed explanation of the issue, including any error messages or steps to reproduce"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters',
                    },
                  })}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    className={`pl-10 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                      errors.category ? 'border-red-300' : ''
                    }`}
                    {...register('category', {
                      required: 'Category is required',
                    })}
                  >
                    <option value="">Select a category</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="ACCESS">Access</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.priority ? 'border-red-300' : ''
                  }`}
                  {...register('priority', {
                    required: 'Priority is required',
                  })}
                >
                  <option value="">Select a priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {errors.priority && (
                  <p className="mt-2 text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700">
                  Expected Completion Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    id="expectedCompletionDate"
                    min={`${minDate}T00:00`}
                    className={`pl-10 mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${
                      errors.expectedCompletionDate ? 'border-red-300' : ''
                    }`}
                    {...register('expectedCompletionDate', {
                      required: 'Expected completion date is required',
                    })}
                  />
                </div>
                {errors.expectedCompletionDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.expectedCompletionDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-3 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => navigate('/tickets')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Create Ticket
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTicket;