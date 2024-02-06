import { RefObject, useEffect, useState } from 'react';

function useIsVisible(ref: RefObject<HTMLElement | null>,) {
  const [isVisible, setIsVisible] = useState(false);
  const callbackFn = (entries: any) => {
    const [ entry ] = entries;
    setIsVisible(entry.isIntersecting);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFn, { root: null, rootMargin: '0px', threshold: 1.0 });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      } 
    }
  }, [ref]);

  return isVisible;
}

export default useIsVisible;