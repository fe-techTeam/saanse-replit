import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onBack?: () => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
  autoFocus?: boolean;
}

export function MaterialSearchBar({
  value,
  onChange,
  onSearch,
  onBack,
  placeholder = "Search",
  suggestions = [],
  className,
  autoFocus = false
}: MaterialSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(value);
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion !== value
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Bar */}
      <div className="relative flex items-center">
        {/* Back Button - separate from search bar */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        {/* Search Input Container */}
        <div
          className={cn(
            "relative flex items-center flex-1 transition-all duration-200 ease-out",
            "bg-transparent border-b-2",
            isFocused
              ? "border-red-500"
              : "border-gray-600 hover:border-gray-500"
          )}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center w-12 h-12 text-gray-400">
            <Search className="w-5 h-5" />
          </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-white placeholder-gray-400",
            "py-3 px-4 text-base leading-6 outline-none",
            "min-w-0" // Prevents flex item from overflowing
          )}
        />

          {/* Clear Button */}
          {value && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className={cn(
            "absolute top-full left-12 right-0 mt-2 z-50",
            "bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50",
            "max-h-64 overflow-hidden"
          )}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left",
                "text-gray-300 hover:text-white hover:bg-gray-800/30",
                "transition-colors duration-150 border-b border-gray-800/30 last:border-b-0"
              )}
            >
              <Search className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}