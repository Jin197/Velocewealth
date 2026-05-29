import { redirect } from 'next/navigation';

/**
 * The dedicated eco-score page was folded into the cross-fleet /insights
 * analytics. We keep this stub so existing bookmarks land on the right
 * screen instead of 404ing.
 */
export default function EcoScoreRedirect() {
  redirect('/insights');
}
