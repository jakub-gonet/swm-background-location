import { useEffect } from "react";

export function useInterval(fn: () => void, interval: number) {
  useEffect(() => {
    const timer = setInterval(fn, interval);
    return () => clearInterval(timer);
  }, [fn]);
}
