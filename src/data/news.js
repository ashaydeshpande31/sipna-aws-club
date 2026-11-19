// ============================================================
//  OFFICIAL NOTICES  (the /news page and the bar at the very top of the site)
//  These now come from settings.json, which the admin page (/admin > Site controls) edits for you.
//  You can still edit settings.json by hand if you like. Dates are YYYY-MM-DD, newest first.
// ============================================================
import S from './settings.json'

// The thin bar at the top of every page. Empty text hides it completely.
export const ANNOUNCEMENT = S.announcement

// kind: 'Notice' | 'Event' | 'Update' | 'Achievement'  (any word works, it is shown as a tag)
export const NEWS = S.news
