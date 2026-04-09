import dotenv from 'dotenv';

// read .env file and populates process.env with the values defined in .env
dotenv.config();

export const config = {
  demoUrl: 'http://localhost:4000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  backendAwsUrl: process.env.BACKEND_AWS_URL || 'https://api.frankz.co.uk',
  basepath: '/task',
};
