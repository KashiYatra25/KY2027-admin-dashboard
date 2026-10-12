"use client";

import { useState, useMemo, useCallback } from "react";
import type { SortDirection } from "./DataTableColumnHeader";

interface UseTableStateOptions<T extends object> {
  data: T[];
  initialPageSize?: number;
  searchableFields?: (keyof T)[];
  sortableFields?: (keyof T)[];
}

interface UseTableStateReturn<T> {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Sorting
  sortKey: string | null;
  sortDirection: SortDirection;
  handleSort: (key: string) => void;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Processed data
  filteredData: T[];
  paginatedData: T[];
  totalItems: number;

  // Reset
  resetAll: () => void;
}

export function useTableState<T extends object>({
  data,
  initialPageSize = 10,
  searchableFields = [],
  sortableFields = [],
}: UseTableStateOptions<T>): UseTableStateReturn<T> {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Handle sort toggle
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  }, [sortKey, sortDirection]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim() && searchableFields.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchableFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === "number") {
            return String(value).includes(query);
          }
          // Handle nested objects
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value).toLowerCase().includes(query);
          }
          return false;
        })
      );
    }

    // Apply sorting
    if (sortKey && sortDirection && sortableFields.includes(sortKey as keyof T)) {
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof T];
        const bVal = b[sortKey as keyof T];

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === "asc" ? 1 : -1;
        if (bVal == null) return sortDirection === "asc" ? -1 : 1;

        // String comparison
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Number comparison
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        // Date comparison
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortDirection === "asc"
            ? aVal.getTime() - bVal.getTime()
            : bVal.getTime() - aVal.getTime();
        }

        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchableFields, sortKey, sortDirection, sortableFields]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setSearchQuery("");
    setSortKey(null);
    setSortDirection(null);
    setCurrentPage(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    sortKey,
    sortDirection,
    handleSort,
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    filteredData,
    paginatedData,
    totalItems,
    resetAll,
  };
}
