import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { LogActivityInput } from '../../lib/validators';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface EnergyFieldsProps {
  register: UseFormRegister<LogActivityInput>;
  errors: FieldErrors<LogActivityInput>;
  watch: UseFormWatch<LogActivityInput>;
}

export const EnergyFields: React.FC<EnergyFieldsProps> = ({ register, errors, watch }) => {
  const subcategory = watch('subcategory');

  const subcategoryOptions = [
    { value: 'electricity', label: 'Electricity Consumption' },
    { value: 'lpg', label: 'LPG Cylinder' },
    { value: 'natural_gas', label: 'Natural Gas' }
  ];

  const valueLabels: Record<string, string> = {
    electricity: 'Consumption (in kWh)',
    lpg: 'Number of LPG Cylinders',
    natural_gas: 'Gas Consumed (in m³)'
  };

  const currentLabel = valueLabels[subcategory] || 'Consumption Value';

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Energy Source"
        options={subcategoryOptions}
        error={errors.subcategory?.message as string}
        {...register('subcategory')}
      />

      <Input
        label={currentLabel}
        type="number"
        step="0.1"
        error={errors.value?.message as string}
        placeholder="e.g. 150"
        {...register('value')}
      />

      {subcategory === 'electricity' && (
        <Input
          label="State/Region"
          type="text"
          error={errors.details?.location?.message as string}
          placeholder="e.g. India"
          {...register('details.location')}
        />
      )}
    </div>
  );
};

export default EnergyFields;
