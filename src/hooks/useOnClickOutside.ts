import { RefObject, useEffect, useRef } from "react";

const defaultEvents = ['mousedown', 'touchstart'];

function useOnClickOutside<E extends Event = Event>(
    ref: RefObject<HTMLElement | null>,
    onClickOutside: (e: E) => void,
) {
  const savedCallback = useRef(onClickOutside);

  useEffect(() => {
    savedCallback.current = onClickOutside;
  }, [onClickOutside])

  useEffect(() => {
    const handler = (event: any) => {
      const { current: el } = ref;
      el && !el.contains(event.target) && savedCallback.current(event);
    };

    for (const eventName of defaultEvents) {
      document.addEventListener(eventName, handler);
    }

    return () => {
      for (const eventName of defaultEvents) {
        document.removeEventListener(eventName, handler);
      }
    }

  }, [ref]);
}

export default useOnClickOutside;