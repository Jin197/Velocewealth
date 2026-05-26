/**
 * Static car-brand/model catalogue used as a typing-time fallback when
 * OCR fails or the user prefers to fill the form by hand. Roughly 50 of
 * the most-sold European brands and their flagship models. Loaded as a
 * normal JS module so it ships in the client bundle (~5 KB gzipped).
 */
export interface CarBrand {
  name: string;
  models: string[];
}

export const CAR_BRANDS: CarBrand[] = [
  {
    name: 'Audi',
    models: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT', 'RS6'],
  },
  {
    name: 'BMW',
    models: ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 7', 'X1', 'X3', 'X5', 'X6', 'X7', 'i3', 'i4', 'i7', 'iX', 'M3', 'M5'],
  },
  {
    name: 'Citroën',
    models: ['C1', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso', 'C5', 'C5 Aircross', 'Berlingo', 'DS3', 'DS4', 'DS7', 'ë-C4'],
  },
  {
    name: 'Dacia',
    models: ['Sandero', 'Sandero Stepway', 'Duster', 'Logan', 'Lodgy', 'Spring', 'Jogger'],
  },
  {
    name: 'Fiat',
    models: ['500', '500e', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Doblò', 'Ducato', '600'],
  },
  {
    name: 'Ford',
    models: ['Fiesta', 'Focus', 'Mondeo', 'Kuga', 'Puma', 'Mustang', 'Mustang Mach-E', 'EcoSport', 'Galaxy', 'S-MAX', 'Ranger', 'Transit'],
  },
  {
    name: 'Honda',
    models: ['Jazz', 'Civic', 'HR-V', 'CR-V', 'e', 'NSX'],
  },
  {
    name: 'Hyundai',
    models: ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe', 'IONIQ 5', 'IONIQ 6', 'Bayon'],
  },
  {
    name: 'Jeep',
    models: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Avenger'],
  },
  {
    name: 'Kia',
    models: ['Picanto', 'Rio', 'Ceed', 'Stonic', 'Niro', 'Sportage', 'Sorento', 'EV6', 'EV9', 'Soul'],
  },
  {
    name: 'Land Rover',
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
  },
  {
    name: 'Lexus',
    models: ['CT', 'IS', 'ES', 'LS', 'UX', 'NX', 'RX', 'RZ', 'LBX'],
  },
  {
    name: 'Mazda',
    models: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-30', 'MX-5'],
  },
  {
    name: 'Mercedes-Benz',
    models: ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT'],
  },
  {
    name: 'MG',
    models: ['MG3', 'MG4', 'MG5', 'ZS', 'EHS', 'Marvel R'],
  },
  {
    name: 'Mini',
    models: ['Cooper', 'One', 'Countryman', 'Clubman', 'Electric', 'Aceman'],
  },
  {
    name: 'Mitsubishi',
    models: ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'L200'],
  },
  {
    name: 'Nissan',
    models: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'Note', 'Pulsar', 'Navara'],
  },
  {
    name: 'Opel',
    models: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Zafira', 'Adam'],
  },
  {
    name: 'Peugeot',
    models: ['108', '208', 'e-208', '2008', 'e-2008', '308', '3008', '408', '508', '5008', 'Rifter', 'Partner', '108 Style', '301'],
  },
  {
    name: 'Polestar',
    models: ['2', '3', '4'],
  },
  {
    name: 'Porsche',
    models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman', '718'],
  },
  {
    name: 'Renault',
    models: ['Twingo', 'Clio', 'Captur', 'Mégane', 'Mégane E-Tech', 'Scénic', 'Scénic E-Tech', 'Kadjar', 'Arkana', 'Austral', 'Espace', 'ZOE', 'Kangoo', 'Trafic', 'Master', '5 E-Tech'],
  },
  {
    name: 'SEAT',
    models: ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Mii'],
  },
  {
    name: 'Škoda',
    models: ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  },
  {
    name: 'Smart',
    models: ['ForTwo', 'ForFour', '#1', '#3'],
  },
  {
    name: 'Subaru',
    models: ['Impreza', 'XV', 'Forester', 'Outback', 'Solterra'],
  },
  {
    name: 'Suzuki',
    models: ['Swift', 'Ignis', 'Vitara', 'S-Cross', 'Jimny', 'Across'],
  },
  {
    name: 'Tesla',
    models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
  },
  {
    name: 'Toyota',
    models: ['Aygo X', 'Yaris', 'Yaris Cross', 'Corolla', 'Camry', 'C-HR', 'RAV4', 'Highlander', 'bZ4X', 'Land Cruiser', 'Hilux', 'Proace', 'Prius'],
  },
  {
    name: 'Volkswagen',
    models: ['up!', 'Polo', 'Golf', 'Passat', 'Arteon', 'T-Cross', 'T-Roc', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz', 'Caddy', 'Multivan'],
  },
  {
    name: 'Volvo',
    models: ['XC40', 'XC60', 'XC90', 'EX30', 'EX90', 'C40', 'S60', 'S90', 'V60', 'V90'],
  },
  {
    name: 'Aston Martin',
    models: ['Vantage', 'DB12', 'DBX', 'DBS'],
  },
  {
    name: 'Bentley',
    models: ['Continental GT', 'Flying Spur', 'Bentayga'],
  },
  {
    name: 'Ferrari',
    models: ['Roma', '296 GTB', 'SF90', 'Purosangue', '812'],
  },
  {
    name: 'Lamborghini',
    models: ['Huracán', 'Urus', 'Revuelto'],
  },
  {
    name: 'Maserati',
    models: ['Ghibli', 'Quattroporte', 'Levante', 'Grecale', 'MC20'],
  },
  {
    name: 'Rolls-Royce',
    models: ['Phantom', 'Ghost', 'Wraith', 'Cullinan', 'Spectre'],
  },
  {
    name: 'Alfa Romeo',
    models: ['Giulia', 'Stelvio', 'Tonale', 'Junior'],
  },
];

/**
 * Flat brand → models lookup. Useful for fuzzy autocomplete.
 */
export const BRANDS_INDEX: Record<string, string[]> = Object.fromEntries(
  CAR_BRANDS.map((b) => [b.name, b.models]),
);

export const BRAND_NAMES = CAR_BRANDS.map((b) => b.name);
