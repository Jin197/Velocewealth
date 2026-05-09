-- ============================================================
-- Velocewealth · Public catalog seed
-- Stations and partner garages — visible to all authenticated users.
-- Run after migrations: supabase db reset, or apply manually.
-- ============================================================

insert into public.stations (name, brand, type, lat, lng, address, city, country, available, total) values
  ('TotalEnergies Access', 'TotalEnergies', 'gas', 48.8566, 2.3522, '12 Rue de Rivoli', 'Paris', 'FR', null, null),
  ('IONITY Mâcon Sud', 'IONITY', 'charger', 46.305, 4.832, 'Aire de Mâcon Sud, A6', 'Mâcon', 'FR', 4, 6),
  ('Carrefour Villeurbanne', 'Carrefour', 'gas', 45.766, 4.879, 'Rue Léon Blum', 'Villeurbanne', 'FR', null, null),
  ('Tesla Supercharger Bagnolet', 'Tesla', 'charger', 48.85, 2.34, 'Porte de Bagnolet', 'Paris', 'FR', 8, 12),
  ('Shell V-Power', 'Shell', 'gas', 50.6292, 3.0573, '88 Rue Nationale', 'Lille', 'FR', null, null),
  ('Engie Pulsar', 'Engie', 'charger', 43.6047, 1.4442, 'Place du Capitole', 'Toulouse', 'FR', 2, 4),
  ('Esso Express', 'Esso', 'gas', 50.8503, 4.3517, 'Avenue Louise 250', 'Bruxelles', 'BE', null, null),
  ('Allego', 'Allego', 'charger', 52.3676, 4.9041, 'Damrak 70', 'Amsterdam', 'NL', 6, 8),
  ('Migrol', 'Migrol', 'gas', 47.3769, 8.5417, 'Bahnhofstrasse 1', 'Zürich', 'CH', null, null),
  ('Total Casablanca', 'TotalEnergies', 'gas', 33.5731, -7.5898, 'Boulevard Mohammed V', 'Casablanca', 'MA', null, null),
  ('Total Dakar Plateau', 'TotalEnergies', 'gas', 14.7167, -17.4677, 'Avenue Léopold Sédar Senghor', 'Dakar', 'SN', null, null),
  ('Petro-Canada', 'Petro-Canada', 'gas', 45.5017, -73.5673, '1234 Rue Sainte-Catherine', 'Montréal', 'CA', null, null);

insert into public.garages (name, address, city, country, lat, lng, is_partner, rating, review_count, services, image_url) values
  ('Garage du Centre', '24 avenue Jean Jaurès', 'Lyon', 'FR', 45.748, 4.842, true, 4.8, 312, array['Vidange','Pneus','Diagnostic','Climatisation'], 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'),
  ('Speedy', '8 rue de la République', 'Lyon', 'FR', 45.764, 4.835, false, 4.2, 189, array['Vidange','Pneus','Freins'], null),
  ('AutoCare Premium', '15 boulevard Haussmann', 'Paris', 'FR', 48.872, 2.331, true, 4.9, 524, array['Toutes marques','Carrosserie','Mécanique','Diagnostic OBD'], 'https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e2d?w=800&q=80'),
  ('Norauto', '120 avenue de la Liberté', 'Bordeaux', 'FR', 44.838, -0.578, false, 4.0, 412, array['Pneus','Vidange','Freins','Batterie'], null),
  ('Atelier Mobilis', 'Rue de la Loi 100', 'Bruxelles', 'BE', 50.847, 4.367, true, 4.7, 156, array['Hybride','Électrique','Mécanique'], null),
  ('Tesla Service Paris', '32 quai de Valmy', 'Paris', 'FR', 48.873, 2.367, true, 4.6, 287, array['Tesla','Diagnostic','Carrosserie'], null);
