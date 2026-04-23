export interface RouteParams {
  '/': Record<string, never>;
  '/home': Record<string, never>;
  '/result': { mbtiType: string };
  '/compat': { myType: string; partnerType: string };
  '/compat-result': { myType: string; partnerType: string };
}
