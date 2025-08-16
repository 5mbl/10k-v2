// lib/pdf-url.js
export const getPdfUrlFromMeta = (meta) => {
    if (!meta) return null;
    if (meta.file_url) return meta.file_url;          
    if (meta.file_name) return `/sec_filings/${meta.file_name}`;
    return null;
  };
  