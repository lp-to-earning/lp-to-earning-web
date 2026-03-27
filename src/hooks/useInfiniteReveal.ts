"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface UseInfiniteRevealOptions {
  batchSize?: number;
  /** 검색·필터·정렬이 바뀔 때마다 바꿔 주면 노출 개수가 초기화됩니다. */
  resetKey?: string;
}

/**
 * 긴 목록을 배치 단위로만 렌더하고, 하단 센티널이 보이면 더 불러옵니다.
 * 스크롤 컨테이너가 overflow 영역이면 `scrollRootRef`를 그 요소에 연결하세요.
 */
export function useInfiniteReveal<T>(
  items: readonly T[],
  options: UseInfiniteRevealOptions = {},
) {
  const { batchSize = 20, resetKey = "" } = options;
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [batchSize, resetKey]);

  const visible = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const root = scrollRootRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + batchSize, items.length));
        }
      },
      { root, rootMargin: "160px", threshold: 0.01 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [batchSize, hasMore, items.length, visibleCount]);

  return { visible, hasMore, sentinelRef, scrollRootRef };
}
