import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ShoppingFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
}

export const ShoppingFields: React.FC<ShoppingFieldsProps> = ({ register, errors, watch }) => {
  const subcategory = watch('subcategory');

  const subcategoryOptions = [
    { value: 'clothing_item', label: 'Clothing / Apparel Item' },
    { value: 'electronics_phone', label: 'Smartphone / Tablet' },
    { value: 'electronics_laptop', label: 'Laptop / Computer' },
    { value: 'online_delivery', label: 'Online Order Delivery' }
  ];

  const valueLabels: Record<string, string> = {
    clothing_item: 'Quantity (number of items)',
    electronics_phone: 'Quantity (number of devices)',
    electronics_laptop: 'Quantity (number of devices)',
    online_delivery: 'Number of deliveries / packages'
  };

  const currentLabel = valueLabels[subcategory] || 'Quantity';

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Purchase Category"
        options={subcategoryOptions}
        error={errors.subcategory?.message as string}
        {...register('subcategory')}
      />

      <Input
        label={currentLabel}
        type="number"
        error={errors.value?.message as string}
        placeholder="e.g. 1"
        {...register('value')}
      />
    </div>
  );
};

export default ShoppingFields;
