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
      // Always increment by 0.01 for precise control
      const newValue = Math.round((value + 0.01) * 100) / 100;
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      // Always decrement by 0.01 for precise control
      const newValue = Math.max(min, Math.round((value - 0.01) * 100) / 100);
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input, decimal point, or leading zero for decimals
    if (inputValue === '' || inputValue === '.' || inputValue === '0' || inputValue === '0.') {
      return;
    }

    // Parse the input value, allowing decimals
    let newValue = parseFloat(inputValue);

    // If parsing failed, don't update
    if (isNaN(newValue)) {
      return;
    }

    // Round to 3 decimal places for more precision
    newValue = Math.round(newValue * 1000) / 1000;

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
        step="0.001"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        onBlur={(e) => {
          // Ensure valid number on blur
          if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
            onChange(min);
          } else {
            // Round to 3 decimal places
            const rounded = Math.round(parseFloat(e.target.value) * 1000) / 1000;
            onChange(rounded);
          }
        }}
        className="w-20 h-8 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
