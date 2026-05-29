import { redirect } from 'next/navigation';

/**
 * The standalone fleet-wide /fuel page is gone — each vehicle's "Énergie"
 * tab now hosts its own fuel history. Anyone landing here on an old link
 * goes to the fleet list, where they can pick the relevant car.
 * /fuel/scan stays untouched (the bottom-tab Plus button targets it).
 */
export default function FuelRedirect() {
  redirect('/vehicles');
}
