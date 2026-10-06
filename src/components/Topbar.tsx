'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="topbar">
      <div className="relative flex-1 max-w-[650px]">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
        <input
          id="search"
          type="text"
          className="search w-full pl-10"
          placeholder="Szukaj zadań, obszarów, opisów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};
