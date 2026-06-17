# Carbon Footprint Methodology

EcoTrace calculates emissions based on standard environmental coefficients derived from the US Environmental Protection Agency (EPA) and international carbon metrics.

---

## 1. Transport Calculation

### Car Commute
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Distance (km)} \times \text{Fuel Factor} \times \frac{1}{\text{Passengers}}$$

**Fuel Factors (kg CO2e / km):**
- Petrol: `0.21`
- Diesel: `0.17`
- Electric Vehicle (EV): `0.05`

### Air Travel (Flight)
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Distance (km)} \times \text{Distance Factor} \times \text{Radiative Forcing Multiplier} \times \text{Seating Class Multiplier}$$

- **Distance Factors:**
  - Short-haul (<1500 km): `0.255` kg CO2e/km
  - Long-haul (>=1500 km): `0.195` kg CO2e/km
- **Radiative Forcing (RF) Multipliers:**
  - Short-haul: `1.0` (Minimal high-altitude warming impact)
  - Long-haul: `2.7` (Accounts for emissions at altitude)
- **Cabin Seating Class Multipliers:**
  - Economy: `1.0`
  - Business: `1.5`
  - First Class: `2.0`

### Public Transit
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Distance (km)} \times \text{Factor}$$

- Bus: `0.089` kg CO2e/km
- Metro: `0.031` kg CO2e/km
- Train: `0.041` kg CO2e/km
- Two Wheeler (Petrol): `0.06` kg CO2e/km
- Two Wheeler (Electric): `0.015` kg CO2e/km

---

## 2. Food & Meals Calculation
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Servings} \times \text{Food Factor}$$

**Food Factors (kg CO2e / serving):**
- Beef: `6.61`
- Lamb: `5.84`
- Pork: `1.23`
- Chicken: `0.69`
- Fish: `0.39`
- Vegetarian Meal: `0.28`
- Vegan Meal: `0.15`
- Dairy (250ml Glass of Milk): `0.64`

---

## 3. Home Energy Calculation

### Electricity
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Consumption (kWh)} \times \text{Grid Factor}$$

- India Grid default factor: `0.71` kg CO2e/kWh (High coal dependency baseline)

### Fuel Gas
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Value} \times \text{Fuel Factor}$$

- LPG Cylinder: `42.3` kg CO2e / cylinder (approx 14.2kg capacity)
- Natural Gas: `2.04` kg CO2e / m³

---

## 4. Shopping & Consumer Goods Calculation
Formula:
$$\text{Emissions (kg } CO_2e) = \text{Quantity} \times \text{Item Factor}$$

**Item Factors (kg CO2e / item):**
- Clothing / Apparel Item: `15.0`
- Smartphone / Tablet: `70.0`
- Laptop / Computer: `300.0`
- Online Order Delivery: `0.5`
