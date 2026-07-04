/**
 * CATEGORIES_MAP — canonical two-level category hierarchy for ATTIZ.
 * Key   = parent category (shown as column headers in the megamenu)
 * Value = array of secondary categories under that parent
 */
export const CATEGORIES_MAP: Record<string, string[]> = {
  MEN: ['Round Neck Tees', 'Polo Tees', 'Joggers', 'Sweatshirts', 'Hoodies'],
  WOMEN: ['Round Neck Tees', 'Polo Tees', 'Joggers', 'Sweatshirts', 'Hoodies'],
  KIDS: ['Round Neck Tees', 'Polo Tees', 'Joggers', 'Sweatshirts'],
  UNISEX: ['Round Neck Tees', 'Polo Tees', 'Joggers', 'Sweatshirts'],
  ACCESSORIES: ['Caps', 'Bags', 'Socks'],
};
