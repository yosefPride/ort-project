import { useEffect, useRef, useState } from 'react';

// Becomes true once the element has scrolled into view, then stops watching.
// The landing page's feature cards use it so their looping animations only start on screen.
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    // -15% waits until the card is a little way up the screen, not still under the fold.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setInView(true);
      observer.disconnect();
    }, { rootMargin: '0px 0px -15% 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}
