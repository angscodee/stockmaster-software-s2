import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-blue-600">StockMaster</h3>
            <p className="text-sm text-gray-500 mt-2">Gestión integral de inventarios y ventas.</p>
          </div>
          <div className="flex gap-8">
             <a href="#" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Términos</a>
             <a href="#" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Privacidad</a>
             <a href="#" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Contacto</a>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} STOCKMASTER INC.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
