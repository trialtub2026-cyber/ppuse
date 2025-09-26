import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface MasterDataOption {
  value: string;
  label: string;
  description?: string;
  [key: string]: any;
}

interface MasterDataSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadOptions: (search?: string) => Promise<MasterDataOption[]>;
  onAddNew?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
  className?: string;
  showDescription?: boolean;
  allowClear?: boolean;
}

const MasterDataSelect: React.FC<MasterDataSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  loadOptions,
  onAddNew,
  addNewLabel = 'Add New',
  disabled = false,
  className,
  showDescription = false,
  allowClear = true
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<MasterDataOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<MasterDataOption | null>(null);

  // Load initial options
  useEffect(() => {
    loadInitialOptions();
  }, []);

  // Update selected option when value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  const loadInitialOptions = async () => {
    setLoading(true);
    try {
      const data = await loadOptions();
      setOptions(data);
    } catch (error) {
      console.error('Failed to load options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (search: string) => {
    setSearchValue(search);
    if (search.length === 0) {
      loadInitialOptions();
      return;
    }

    setLoading(true);
    try {
      const data = await loadOptions(search);
      setOptions(data);
    } catch (error) {
      console.error('Failed to search options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      if (allowClear) {
        onValueChange('');
        setSelectedOption(null);
      }
    } else {
      onValueChange(selectedValue);
      const option = options.find(opt => opt.value === selectedValue);
      setSelectedOption(option || null);
    }
    setOpen(false);
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setSelectedOption(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption ? (
              <>
                <span className="truncate">{selectedOption.label}</span>
                {showDescription && selectedOption.description && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedOption.description}
                  </Badge>
                )}
              </>
            ) : (
              placeholder
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedOption && allowClear && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleClear}
              >
                ×
              </Button>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={handleSelect}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Check
                          className={cn(
                            'h-4 w-4',
                            value === option.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{option.label}</div>
                          {showDescription && option.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {onAddNew && (
                  <>
                    <div className="border-t" />
                    <CommandGroup>
                      <CommandItem onSelect={handleAddNew} className="text-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        {addNewLabel}
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MasterDataSelect;