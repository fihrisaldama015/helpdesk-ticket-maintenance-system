// Mock implementation of axios instance
const mockAxios = {
  create: jest.fn(() => mockAxios),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
  defaults: {
    headers: {},
  },
};

// Mock the axios module
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxios),
  ...jest.requireActual('axios'),
}));

// Mock the environment variable
const originalEnv = process.env;
process.env = {
  ...originalEnv,
  VITE_API_BASE_URL: 'http://localhost:5000/api',
};

export default mockAxios;
