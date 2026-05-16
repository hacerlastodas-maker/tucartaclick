import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-6 mt-8 text-center bg-black/40 backdrop-blur-md border-t border-white/5">
      <p className="text-sm text-gray-400">
        Desarrollado por{' '}
        <a 
          href="https://darw.cl" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-primary transition-colors font-medium ml-1"
        >
          Darw.cl
        </a>
      </p>
    </footer>
  );
}
