import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 mb-6">
            <FileQuestion size={48} />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 transition-colors"
            >
              Go Back
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;