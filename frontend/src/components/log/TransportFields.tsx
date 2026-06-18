import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { LogActivityInput } from '../../lib/validators';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TransportFieldsProps {
  register: UseFormRegister<LogActivityInput>;
  errors: FieldErrors<LogActivityInput>;
  watch: UseFormWatch<LogActivityInput>;
}

export const TransportFields: React.FC<TransportFieldsProps> = ({ register, errors, watch }) => {
  const subcategory = watch('subcategory');

  const subcategoryOptions = [
    { value: 'car', label: 'Car Commute' },
    { value: 'flight', label: 'Flight / Air Travel' },
    { value: 'bus', label: 'Bus Trip' },
    { value: 'metro', label: 'Metro ride' },
    { value: 'train', label: 'Train travel' },
    { value: 'two_wheeler_petrol', label: 'Motorbike / Scooter (Petrol)' },
    { value: 'two_wheeler_electric', label: 'Electric Scooter (EV)' }
  ];

  const vehicleTypeOptions = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'EV', label: 'Electric Vehicle (EV)' }
  ];

  const cabinClassOptions = [
    { value: 'economy', label: 'Economy' },
    { value: 'business', label: 'Business Class' },
    { value: 'first', label: 'First Class' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Transport Mode"
        options={subcategoryOptions}
        error={errors.subcategory?.message as string}
        {...register('subcategory')}
      />

      <Input
        label="Distance (in km)"
        type="number"
        step="0.1"
        error={errors.value?.message as string}
        placeholder="e.g. 15.5"
        {...register('value')}
      />

      {subcategory === 'car' && (
        <Select
          label="Fuel/Engine Type"
          options={vehicleTypeOptions}
          error={errors.details?.vehicleType?.message as string}
          {...register('details.vehicleType')}
        />
      )}

      {subcategory === 'flight' && (
        <Select
          label="Cabin Seating Class"
          options={cabinClassOptions}
          error={errors.details?.cabinClass?.message as string}
          {...register('details.cabinClass')}
        />
      )}

      {subcategory === 'car' && (
        <Input
          label="Number of Passengers"
          type="number"
          error={errors.details?.passengers?.message as string}
          placeholder="1"
          {...register('details.passengers')}
        />
      )}
    </div>
  );
};
export default TransportFields;
