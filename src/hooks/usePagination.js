// src/hooks/usePagination.js
import { useState, useEffect, useCallback } from 'react';

export const usePagination = (fetchApi, filters = {}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 30 });

  const [hasNext, setHasNext] = useState(false);
  const [cursorHistory, setCursorHistory] = useState([null]);

  // DataGrid requires rowCount for server pagination UI.
  // Cursor APIs don't have total => use best-effort "virtual total".
  const [rowCount, setRowCount] = useState(0);

  const fetchData = useCallback(
    async ({ page, pageSize, cursor }) => {
      setLoading(true);
      try {
        const params = { size: pageSize, cursor, ...filters };
        const res = await fetchApi(params);

        const payload = res?.data || {};
        const items = payload.items || [];

        setRows(items);
        setHasNext(!!payload.hasNext);

        const base = page * pageSize + items.length;
        setRowCount(payload.hasNext ? base + 1 : base);

        setCursorHistory((prev) => {
          const copy = [...prev];
          copy[page] = cursor ?? null;                 // cursor used for this page
          copy[page + 1] = payload.nextCursor ?? null; // cursor for next page
          return copy;
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setRows([]);
        setHasNext(false);
        setRowCount(0);
        setCursorHistory([null]);
      } finally {
        setLoading(false);
      }
    },
    [fetchApi, filters]
  );

  // ✅ reset when filters OR pageSize changes
  useEffect(() => {
    const pageSize = paginationModel.pageSize;

    // reset to first page when filters OR pageSize changes
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setCursorHistory([null]);

    fetchData({ page: 0, pageSize, cursor: null });
  }, [fetchData, filters, paginationModel.pageSize]);

  const onPaginationModelChange = useCallback(
    (newModel) => {
      if (loading) return;

      const { page, pageSize } = newModel;

      // pageSize changed => reset & fetch first page
      if (pageSize !== paginationModel.pageSize) {
        setPaginationModel({ page: 0, pageSize });
        setCursorHistory([null]);
        fetchData({ page: 0, pageSize, cursor: null });
        return;
      }

      // moving forward but no next => stop
      if (page > paginationModel.page && !hasNext) return;

      const cursor = cursorHistory[page] ?? null;

      setPaginationModel(newModel);
      fetchData({ page, pageSize, cursor });
    },
    [loading, paginationModel.page, paginationModel.pageSize, cursorHistory, fetchData, hasNext]
  );

  const refetch = useCallback(() => {
    const { page, pageSize } = paginationModel;
    const cursor = cursorHistory[page] ?? null;
    fetchData({ page, pageSize, cursor });
  }, [fetchData, paginationModel, cursorHistory]);

  return {
    rows,
    loading,
    paginationModel,
    rowCount,
    onPaginationModelChange,
    refetch,
    hasNext,
  };
};