import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogActivitySchema } from '../../lib/validators';
import { useActivities } from '../../hooks/useActivities';
import { estimateEmissions } from '../../lib/emissions';
import TransportFields from './TransportFields';
import FoodFields from './FoodFields';
import EnergyFields from './EnergyFields';
import ShoppingFields from './ShoppingFields';
import EmissionPreview from './EmissionPreview';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ActivityFormProps {
  onSuccess?: () => void;
}

const CATEGORY_DEFAULTS: Record<'transport' | 'food' | 'energy' | 'shopping', { subcategory: string; value: string; details: any }> = {
  transport: { subcategory: 'car', value: '', details: { vehicleType: 'petrol', passengers: 1, cabinClass: 'economy' } },
  food: { subcategory: 'vegetarian', value: '', details: {} },
  energy: { subcategory: 'electricity', value: '', details: { location: 'India' } },
  shopping: { subcategory: 'clothing_item', value: '', details: {} }
};

export const ActivityForm: React.FC<ActivityFormProps> = ({ onSuccess }) => {
  const { logActivity, isLogging } = useActivities();

  // Get current date string for default value (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(LogActivitySchema),
    defaultValues: {
      category: 'transport',
      subcategory: 'car',
      value: '',
      details: {
        vehicleType: 'petrol',
        passengers: 1,
        cabinClass: 'economy'
      },
      timestamp: getTodayString()
    }
  });

  const category = watch('category') as 'transport' | 'food' | 'energy' | 'shopping';
  const subcategory = watch('subcategory');
  const value = watch('value');
  const details = watch('details');

  // Handle category changes and set proper defaults
  const handleCategoryChange = (newCategory: 'transport' | 'food' | 'energy' | 'shopping') => {
    setValue('category', newCategory);
    const defaults = CATEGORY_DEFAULTS[newCategory];
    setValue('subcategory', defaults.subcategory);
    setValue('value', defaults.value as any);
    setValue('details', defaults.details);
  };

  // Live estimated emission value
  const numValue = Number(value) || 0;
  const liveEmissions = estimateEmissions(category, subcategory, numValue, details);

  const onSubmit = async (data: any) => {
    try {
      // Map local date representation to valid ISO datetime
      const isoTimestamp = new Date(data.timestamp).toISOString();
      await logActivity({
        ...data,
        timestamp: isoTimestamp
      });
      // Reset after success
      reset({
        category: 'transport',
        subcategory: 'car',
        value: '',
        details: {
          vehicleType: 'petrol',
          passengers: 1,
          cabinClass: 'economy'
        },
        timestamp: getTodayString()
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Handled in mutation hook
    }
  };

  const categoriesList: { value: typeof category; label: string; icon: string }[] = [
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'food', label: 'Food & Meals', icon: '🍲' },
    { value: 'energy', label: 'Home Energy', icon: '⚡' },
    { value: 'shopping', label: 'Consumption / Shop', icon: '🛒' }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category selector grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {categoriesList.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => handleCategoryChange(cat.value)}
            className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
              category === cat.value
                ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-lg shadow-emerald-950/45'
                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span className="mb-1 text-2xl">{cat.icon}</span>
            <span className="text-sm font-semibold">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Form inputs container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm space-y-4">
        {category === 'transport' && (
          <TransportFields register={register} errors={errors} watch={watch} />
        )}
        {category === 'food' && (
          <FoodFields register={register} errors={errors} />
        )}
        {category === 'energy' && (
          <EnergyFields register={register} errors={errors} watch={watch} />
        )}
        {category === 'shopping' && (
          <ShoppingFields register={register} errors={errors} watch={watch} />
        )}

        <Input
          label="Log Date"
          type="date"
          error={errors.timestamp?.message as string}
          max={getTodayString()}
          {...register('timestamp')}
        />
      </div>

      {/* Emission preview */}
      <EmissionPreview emissions={liveEmissions} category={category} />

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center text-base py-3"
        isLoading={isLogging}
      >
        Submit Emission Log
      </Button>
    </form>
  );
};

export default ActivityForm;
