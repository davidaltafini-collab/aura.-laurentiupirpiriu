export function useSiteUrl(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}
