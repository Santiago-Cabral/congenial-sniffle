import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";

export default function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <Menu size={24} />
        </button>
        
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]" 
          />
          <input
            type="search"
            placeholder="Buscar productos, órdenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-2.5 w-96 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-full hover:bg-gray-100 transition">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}