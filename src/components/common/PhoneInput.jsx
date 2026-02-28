import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', minLength: 10, maxLength: 10 },
  { code: '+1', country: 'United States', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: '+1', country: 'Canada', flag: '🇨🇦', minLength: 10, maxLength: 10 },
  { code: '+91', country: 'India', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: '+86', country: 'China', flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: '+81', country: 'Japan', flag: '🇯🇵', minLength: 10, maxLength: 10 },
  { code: '+49', country: 'Germany', flag: '🇩🇪', minLength: 10, maxLength: 11 },
  { code: '+33', country: 'France', flag: '🇫🇷', minLength: 9, maxLength: 9 },
  { code: '+61', country: 'Australia', flag: '🇦🇺', minLength: 9, maxLength: 9 },
  { code: '+971', country: 'UAE', flag: '🇦🇪', minLength: 9, maxLength: 9 },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', minLength: 9, maxLength: 9 },
  { code: '+39', country: 'Italy', flag: '🇮🇹', minLength: 9, maxLength: 10 },
  { code: '+34', country: 'Spain', flag: '🇪🇸', minLength: 9, maxLength: 9 },
  { code: '+7', country: 'Russia', flag: '🇷🇺', minLength: 10, maxLength: 10 },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', minLength: 9, maxLength: 10 },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', minLength: 10, maxLength: 11 },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', minLength: 10, maxLength: 10 },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', minLength: 9, maxLength: 9 },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', minLength: 10, maxLength: 10 },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', minLength: 10, maxLength: 10 },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', minLength: 9, maxLength: 10 },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', minLength: 9, maxLength: 12 },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', minLength: 9, maxLength: 10 },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', minLength: 8, maxLength: 8 },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', minLength: 9, maxLength: 9 },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', minLength: 9, maxLength: 10 },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', minLength: 10, maxLength: 10 },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', minLength: 10, maxLength: 10 },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', minLength: 10, maxLength: 10 },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', minLength: 9, maxLength: 9 },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', minLength: 10, maxLength: 10 },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', minLength: 10, maxLength: 10 },
  { code: '+98', country: 'Iran', flag: '🇮🇷', minLength: 10, maxLength: 10 },
  { code: '+972', country: 'Israel', flag: '🇮🇱', minLength: 9, maxLength: 9 },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', minLength: 9, maxLength: 9 },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', minLength: 9, maxLength: 9 },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', minLength: 9, maxLength: 9 },
  { code: '+43', country: 'Austria', flag: '🇦🇹', minLength: 10, maxLength: 11 },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', minLength: 8, maxLength: 8 },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', minLength: 9, maxLength: 9 },
  { code: '+47', country: 'Norway', flag: '🇳🇴', minLength: 8, maxLength: 8 },
  { code: '+48', country: 'Poland', flag: '🇵🇱', minLength: 9, maxLength: 9 },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', minLength: 9, maxLength: 9 },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', minLength: 9, maxLength: 9 },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿', minLength: 8, maxLength: 10 },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', minLength: 8, maxLength: 8 },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', minLength: 9, maxLength: 9 },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', minLength: 10, maxLength: 10 },
  { code: '+56', country: 'Chile', flag: '🇨🇱', minLength: 9, maxLength: 9 },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', minLength: 10, maxLength: 10 },
];

// Sort by country name for better UX
COUNTRY_CODES.sort((a, b) => a.country.localeCompare(b.country));

const PhoneInput = ({ 
  label, 
  name,
  value, 
  onChange, 
  error,
  disabled = false,
  required = false,
  className = '',
}) => {
  const [countryCode, setCountryCode] = useState('+44');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse initial value if provided
  useEffect(() => {
    if (value && typeof value === 'string' && value.startsWith('+')) {
      const matchedCode = COUNTRY_CODES.find(cc => value.startsWith(cc.code));
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        let phoneNum = value.substring(matchedCode.code.length).trim();
        // Remove leading 0 if present
        if (phoneNum.startsWith('0')) {
          phoneNum = phoneNum.substring(1);
        }
        setPhoneNumber(phoneNum);
      }
    }
  }, [value]);

  const handleCountryCodeChange = (newCode) => {
    setCountryCode(newCode);
    setIsOpen(false);
    // Trigger parent onChange with both country code and phone number
    onChange({ 
      target: { 
        name, 
        value: { countryCode: newCode, mobileNumber: phoneNumber }
      } 
    });
  };

  const handlePhoneNumberChange = (e) => {
    let newNumber = e.target.value.replace(/\D/g, ''); // Only digits
    
    // Remove leading 0 if present (common in UK numbers)
    if (newNumber.startsWith('0')) {
      newNumber = newNumber.substring(1);
    }
    
    setPhoneNumber(newNumber);
    // Trigger parent onChange with both country code and phone number
    onChange({ 
      target: { 
        name, 
        value: { countryCode: countryCode, mobileNumber: newNumber }
      } 
    });
  };

  const selectedCountry = COUNTRY_CODES.find(cc => cc.code === countryCode && cc.country);
  const phoneLength = phoneNumber.length;
  const isValid = selectedCountry && 
                  phoneLength >= selectedCountry.minLength && 
                  phoneLength <= selectedCountry.maxLength;
  const showValidation = phoneNumber && phoneLength > 0;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {/* Custom Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              flex items-center justify-between gap-2 rounded-lg border w-28
              px-3 py-2.5 h-[42px]
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'}
              ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}
              text-slate-900 text-sm
              focus:outline-none focus:ring-2
              transition-colors duration-200
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">{selectedCountry?.flag}</span>
              <span className="leading-none">{countryCode}</span>
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute z-50 mt-1 w-64 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {COUNTRY_CODES.map((cc, index) => (
                <button
                  key={`${cc.code}-${index}`}
                  type="button"
                  onClick={() => handleCountryCodeChange(cc.code)}
                  className={`
                    w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors flex items-center gap-2
                    ${cc.code === countryCode ? 'bg-primary-50 text-primary-700' : 'text-slate-900'}
                  `}
                >
                  <span className="text-2xl" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, sans-serif' }}>{cc.flag}</span>
                  <span className="font-medium">{cc.code}</span>
                  <span className="text-sm text-slate-600">{cc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          id={name}
          name={name}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={selectedCountry ? `${selectedCountry.minLength} digits (with or without 0)` : 'Enter phone number'}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg border h-[42px]
            px-3 py-2.5
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'}
            ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
            text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2
            transition-colors duration-200
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {!error && showValidation && !isValid && selectedCountry && (
        <p className="mt-1 text-sm text-amber-600">
          {phoneLength < selectedCountry.minLength 
            ? `Enter at least ${selectedCountry.minLength} digits`
            : `Maximum ${selectedCountry.maxLength} digits allowed`}
        </p>
      )}
      {!error && !showValidation && (
        <p className="mt-1 text-xs text-slate-500">
          Enter with or without leading 0 (e.g., 7501873305 or 07501873305)
        </p>
      )}
      {!error && showValidation && isValid && (
        <p className="mt-1 text-sm text-green-600">
          ✓ Valid {selectedCountry?.country} number
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
