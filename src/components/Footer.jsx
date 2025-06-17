import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step-by-step instructions */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Step 1:</span> Ask a question about stocks, companies, or financial metrics</p>
            <p><span className="font-medium">Step 2:</span> AI analyzes and breaks down your question</p>
            <p><span className="font-medium">Step 3:</span> Get detailed answers with evidence</p>
          </div>

          {/* Attribution */}
          <div className="flex flex-col items-end justify-center">
            <img 
              src="/hwr-logo.svg" 
              alt="HWR Logo" 
              className="h-8 mb-2"
            />
            <p className="text-sm text-gray-600">
              Built by Serdar Palaoglu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
