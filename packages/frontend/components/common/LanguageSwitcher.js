import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { languages } from '../../lib/dummyData';
import { ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 focus:outline-none"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="hidden sm:block">{currentLang?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  changeLanguage(language.code);
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-secondary-50 ${
                  currentLanguage === language.code ? 'bg-primary-50 text-primary-700' : 'text-secondary-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
