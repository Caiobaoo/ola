import React, { useState } from "react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-300 rounded shadow-lg z-10">
          {React.Children.map(children, (child) => {
            if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
              return React.cloneElement(child, { handleSelect });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children }) => (
  <div className="flex items-center justify-between p-2 border border-gray-300 rounded cursor-pointer">
    {children}
  </div>
);

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => (
  <span className="text-gray-700">
    {children || placeholder || "Selecione uma opção"}
  </span>
);

interface SelectContentProps {
  children: React.ReactNode;
  handleSelect?: (value: string) => void;
}

const SelectContent: React.FC<SelectContentProps> = ({ children, handleSelect }) => (
  <div className="p-2">
    {React.Children.map(children, (child) => {
      if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
        return React.cloneElement(child, { handleSelect });
      }
      return child;
    })}
  </div>
);

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  handleSelect?: (value: string) => void;
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children, handleSelect }) => (
  <div
    className="p-2 hover:bg-gray-100 cursor-pointer"
    onClick={() => handleSelect?.(value)}
  >
    {children}
  </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
