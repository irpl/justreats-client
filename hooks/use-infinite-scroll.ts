"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export interface PaginatedResponse<T> {
  content: T[]
  totalPages?: number
  totalElements?: number
  last?: boolean
  size?: number
  number?: number
  hasNext?: boolean
}

interface UseInfiniteScrollOptions<T> {
  initialPage?: number
  pageSize?: number
  fetchFunction: (page: number, size: number) => Promise<PaginatedResponse<T> | T[]>
  enabled?: boolean
}

export function useInfiniteScroll<T>({
  initialPage = 1, // Changed from 0 to 1
  pageSize = 6,
  fetchFunction,
  enabled = true,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  // Add a ref to track if initial load has been done
  const initialLoadDoneRef = useRef(false)

  const loadItems = useCallback(
    async (pageToLoad: number, append = true) => {
      if (!enabled) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetchFunction(pageToLoad, pageSize)

        // Handle different response formats
        let newItems: T[] = []
        let hasMoreItems = false

        if (Array.isArray(response)) {
          // If the response is a plain array
          newItems = response
          hasMoreItems = response.length === pageSize
        } else {
          // If the response is a paginated response object
          newItems = response.content
          hasMoreItems =
            response.hasNext ||
            response.last === false ||
            (response.number !== undefined &&
              response.totalPages !== undefined &&
              response.number < response.totalPages - 1)
        }

        if (append) {
          setItems((prev) => [...prev, ...newItems])
        } else {
          setItems(newItems)
        }

        setHasMore(hasMoreItems)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch items"))
        console.error("Error fetching items:", err)
      } finally {
        setLoading(false)
      }
    },
    [fetchFunction, pageSize] // Remove enabled from the dependency array
  )

  // Initial load - only run this once when enabled becomes true
  useEffect(() => {
    if (enabled && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true
      loadItems(initialPage, false)
    }
  }, [loadItems, initialPage, enabled])

  // Reset the initial load flag when enabled changes to false
  useEffect(() => {
    if (!enabled) {
      initialLoadDoneRef.current = false
    }
  }, [enabled])

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          loadItems(nextPage)
        }
      },
      { threshold: 0.1 },
    )

    const currentLoaderRef = loaderRef.current
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef)
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef)
      }
    }
  }, [loadItems, hasMore, loading, page, enabled])

  const resetItems = useCallback(() => {
    setItems([])
    setPage(initialPage)
    setHasMore(true)
    initialLoadDoneRef.current = false // Reset the initial load flag
    if (enabled) {
      loadItems(initialPage, false)
    }
  }, [initialPage, loadItems, enabled])

  return {
    items,
    loading,
    error,
    hasMore,
    loaderRef,
    resetItems,
  }
}
