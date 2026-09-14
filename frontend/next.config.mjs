import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.100.5', 'localhost:3000'],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default nextConfig;
