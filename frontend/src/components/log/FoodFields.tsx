import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface FoodFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export const FoodFields: React.FC<FoodFieldsProps> = ({ register, errors }) => {
  const foodTypeOptions = [
    { value: 'beef', label: 'Beef Serving' },
    { value: 'lamb', label: 'Lamb Serving' },
    { value: 'pork', label: 'Pork Serving' },
    { value: 'chicken', label: 'Chicken Serving' },
    { value: 'fish', label: 'Fish Serving' },
    { value: 'vegetarian', label: 'Vegetarian Meal' },
    { value: 'vegan', label: 'Vegan Meal' },
    { value: 'dairy', label: 'Dairy (Glass of Milk 250ml)' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Food Item/Meal Type"
        options={foodTypeOptions}
        error={errors.subcategory?.message as string}
        {...register('subcategory')}
      />

      <Input
        label="Number of Servings/Meals"
        type="number"
        step="0.5"
        error={errors.value?.message as string}
        placeholder="e.g. 1"
        {...register('value')}
      />
    </div>
  );
};
export default FoodFields;
