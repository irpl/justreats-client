"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/utils/api";

export default function DebugPage() {
  const [env, setEnv] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Create a mapping of environment variables
    const envVars: Record<string, string> = {
      'NODE_ENV': process.env.NODE_ENV || 'not set',
      'NEXT_PUBLIC_API_BASE_URL': process.env.NEXT_PUBLIC_API_BASE_URL || 'not set',
    };
    
    setEnv(envVars);
    
    // Force a call to the API base URL to see logs
    getApiBaseUrl();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded-md">
          {JSON.stringify(env, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">API Base URL</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>getApiBaseUrl():</strong> {getApiBaseUrl()}</p>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Note: Check the browser console for more detailed logs about environment variable loading.
        </p>
      </div>
    </div>
  );
} 