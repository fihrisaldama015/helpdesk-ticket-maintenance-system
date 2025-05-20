import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertCircle, ArrowRight, Calendar as CalendarIcon, FileText, Loader, Tag, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import Layout from '../../components/layout/Layout';
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
  const [showError, setShowError] = useState<boolean>(false);
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

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'LOW': return 'bg-green-50 text-green-700 border-green-300';
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'HIGH': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getPriorityIcon = (priority: TicketPriority) => {
    switch (priority) {
      case 'LOW':
        return <span className="flex h-2 w-2 rounded-full bg-green-500"></span>;
      case 'MEDIUM':
        return <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>;
      case 'HIGH':
        return <span className="flex h-2 w-2 rounded-full bg-red-500"></span>;
      default:
        return null;
    }
  };

  return (
    <Layout requireAuth allowedRoles={['L1_AGENT']}>
      <div className="flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-4xl transform transition-all duration-300 hover:shadow-xl">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center">
              <span className="p-2 bg-blue-100 rounded-lg mr-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </span>
              <div>
                <h3 className="text-xl leading-6 w-fit font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                  Create New Ticket
                </h3>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  Create a new support ticket with the information below. Our support team will respond as soon as possible.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {showError && error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-pulse">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                  <button
                    className="ml-auto text-red-500 hover:text-red-700 transition-colors duration-200"
                    onClick={() => setShowError(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="transition-all duration-300 transform ">
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
                    className={`pl-10 py-3 block w-full text-gray-700 bg-white border rounded-lg outline-none ring-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Brief description of the issue"
                  />
                </div>
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="transition-all duration-300 transform ">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`block w-full text-gray-700 bg-white border rounded-lg outline-none p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 ${formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Detailed description of the issue including any error messages or steps to reproduce"
                  />
                </div>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="transition-all duration-300 transform ">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, category: value as TicketCategory }));
                      if (formErrors.category) {
                        setFormErrors(prev => ({ ...prev, category: undefined }));
                      }
                    }}
                  >
                    <SelectTrigger className={`pl-10 w-full ${formErrors.category ? 'border-red-300 bg-red-50' : ''}`}>
                      <div className="absolute left-3">
                        <Tag className="h-4 w-4 text-gray-400" />
                      </div>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HARDWARE">Hardware</SelectItem>
                      <SelectItem value="SOFTWARE">Software</SelectItem>
                      <SelectItem value="NETWORK">Network</SelectItem>
                      <SelectItem value="ACCESS">Access</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div className={`transition-all duration-300 transform `}>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, priority: value as TicketPriority }));
                      if (formErrors.priority) {
                        setFormErrors(prev => ({ ...prev, priority: undefined }));
                      }
                    }}
                  >
                    <SelectTrigger className={`pl-10 w-full ${formData.priority ? getPriorityColor(formData.priority) : ''} ${formErrors.priority ? 'border-red-300 bg-red-50' : ''}`}>
                      <div className="absolute left-3">
                        {formData.priority ? getPriorityIcon(formData.priority) : <Tag className="h-4 w-4 text-gray-400" />}
                      </div>
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.priority && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.priority}
                    </p>
                  )}
                </div>

              </div>
              <div className="transition-all duration-300 transform">
                <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Completion Date
                </label>

                {/* Split date display and picker trigger */}
                <div className="flex flex-col items-center sm:flex-row w-fit gap-2">
                  {/* Date display section - takes most of the width on larger screens */}
                  <div className={cn(
                    "w-full sm:w-3/4 p-2 border rounded-md flex items-center",
                    !formData.expectedCompletionDate && "text-gray-400",
                    formErrors.expectedCompletionDate && "border-red-300 bg-red-50"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {formData.expectedCompletionDate ? (
                      format(new Date(formData.expectedCompletionDate), "PPP")
                    ) : (
                      <span>No date selected</span>
                    )}
                  </div>

                  <div className="w-full sm:w-1/4">
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          type='button'
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors duration-300 shadow-md hover:shadow-lg"
                        >
                          <CalendarIcon className="h-5 w-5" />
                          <span>Pick</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="rounded-md border bg-popover p-4 text-popover-foreground shadow-md">
                          <Calendar
                            mode="single"
                            selected={formData.expectedCompletionDate ? new Date(formData.expectedCompletionDate) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                setFormData(prev => ({
                                  ...prev,
                                  expectedCompletionDate: new Date(date).toISOString()
                                }));
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {formErrors.expectedCompletionDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {formErrors.expectedCompletionDate}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4 mt-8 border-t border-gray-100">
                <Button
                  type="button"
                  variant='outline'
                  className="mr-4 hover:bg-gray-50 transition-all duration-200 transform hover:translate-y-[-2px]"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="transition-all group hover:translate-y-[-2px] bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  <span className="flex items-center">
                    {isLoading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        <span className="sr-only">Creating...</span>
                      </>
                    ) : (
                      "Create Ticket"
                    )}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTicket;