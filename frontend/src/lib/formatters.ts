export function formatCO2e(kg: number): string {
  if (kg < 0) return '0 g CO2e';
  
  if (kg < 1) {
    const grams = Math.round(kg * 1000);
    return `${grams} g CO2e`;
  }
  
  if (kg >= 1000) {
    const tons = kg / 1000;
    // Format to 1 decimal place if fractional, e.g. 1.5 t CO2e, or just 2 t CO2e
    const formatted = Number.isInteger(tons) ? tons.toString() : tons.toFixed(1);
    return `${formatted} t CO2e`;
  }
  
  const formattedKg = Number.isInteger(kg) ? kg.toString() : kg.toFixed(1);
  return `${formattedKg} kg CO2e`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
