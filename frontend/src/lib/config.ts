export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (process.env.VERCEL_URL) {
    // Vercel populates this automatically
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback for local development if env var is missing
  return 'http://localhost:3000';
};
