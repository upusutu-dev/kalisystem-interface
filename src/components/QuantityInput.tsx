import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  'data-testid'?: string;
}

export function QuantityInput({ 
  value, 
  onChange, 
  min = 0, 
  max, 
  className = '',
  'data-testid': dataTestId 
}: QuantityInputProps) {
  const handleIncrement = () => {
    if (max === undefined || value < max) {
      const increment = value < 1 ? 0.1 : 1;
      const newValue = Math.round((value + increment) * 100) / 100;
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      const decrement = value <= 1 ? 0.1 : 1;
      const newValue = Math.max(min, Math.round((value - decrement) * 100) / 100);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle empty input without immediately resetting to 0
    if (e.target.value === '' || e.target.value === '.') {
      return;
    }
    
    // Parse the input value
    const newValue = parseFloat(e.target.value);
    
    // If parsing failed, keep the current value
    if (isNaN(newValue)) {
      e.target.value = value.toString();
      return;
    }
    
    // Clamp the value between min and max
    const clampedValue = Math.max(min, max !== undefined ? Math.min(max, newValue) : newValue);
    onChange(clampedValue);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-8 w-8 p-0"
        data-testid={dataTestId ? `${dataTestId}-minus` : undefined}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <Input
        type="number"
        step="0.1"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={(e) => {
          // Ensure valid number on blur
          if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
            onChange(min);
          } else {
            // Round to 2 decimal places
            const rounded = Math.round(parseFloat(e.target.value) * 100) / 100;
            onChange(rounded);
          }
        }}
        className="w-16 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        data-testid={dataTestId ? `${dataTestId}-input` : undefined}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="h-8 w-8 p-0"
        data-testid={dataTestId ? `${dataTestId}-plus` : undefined}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
