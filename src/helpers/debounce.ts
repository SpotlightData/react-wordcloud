export function debounce(
  func: (...args: any[]) => void,
  wait: number,
  immediate?: boolean,
): (...args: any[]) => void {
  let timeout: number;
  const context = null;
  return function(...args: any[]): void {
    var later = function() {
      timeout = null;
      if (!immediate) return func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(later, wait);
    if (callNow) return func.apply(context, args);
  };
}
