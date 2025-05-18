import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/Button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 text-red-600 mb-6">
            <ShieldAlert size={48} />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            You do not have permission to access this page.
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
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Unauthorized;