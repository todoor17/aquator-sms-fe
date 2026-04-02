"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchClients,
  fetchClientResources,
} from "@/store/slices/clients/thunks";
import type {
  FetchClientsParams,
  FetchClientsResponse,
} from "@/models/clients/clients";
import PageHeader from "@/components/page-header/PageHeader";
import SearchToolbar from "@/components/search-toolbar/SearchToolbar";
import ClientList from "@/components/client-list/ClientList";
import styles from "./page.module.css";

const LIMIT = 50;
const MAX_PAGES = 6;

function HomeContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clients = useSelector((state: RootState) => state.clients.items);
  const totalQuantity = useSelector(
    (state: RootState) => state.clients.totalQuantity,
  );
  const resources = useSelector((state: RootState) => state.clients.resources);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [magazin, setMagazin] = useState(searchParams.get("magazin") || "");
  const [anComanda, setAnComanda] = useState(
    searchParams.get("anComanda") || "",
  );
  const [lunaComanda, setLunaComanda] = useState(
    searchParams.get("lunaComanda") || "",
  );
  const [tipClient, setTipClient] = useState(
    searchParams.get("tipClient") || "",
  );
  const [smsEnabled, setSmsEnabled] = useState(
    searchParams.get("smsEnabled") || "",
  );
  const [mode, setMode] = useState(searchParams.get("mode") || "");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const filtersRef = useRef<FetchClientsParams>({ offset: 1, limit: LIMIT });
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<any>(undefined);

  const hasMore = clients.length < totalQuantity && pageRef.current < MAX_PAGES;

  useEffect(() => {
    dispatch(fetchClientResources());
  }, [dispatch]);

  // --- Search (initial + on submit) ---

  const doSearch = useCallback(
    (filters: FetchClientsParams) => {
      abortRef.current?.abort();

      const params = { ...filters, offset: 1, limit: LIMIT };
      filtersRef.current = params;
      pageRef.current = 1;
      setIsInitialLoading(true);

      const promise = dispatch(fetchClients({ onlyFilters: true, params }));
      abortRef.current = promise;
      promise.then(() => setIsInitialLoading(false));
    },
    [dispatch],
  );

  // Initial load from URL
  useEffect(() => {
    doSearch({
      search: searchParams.get("search") || "",
      magazin: searchParams.get("magazin") || "",
      anComanda: searchParams.get("anComanda") || "",
      lunaComanda: searchParams.get("lunaComanda") || "",
      tipClient: searchParams.get("tipClient") || "",
      smsEnabled: searchParams.get("smsEnabled") || "",
      mode: searchParams.get("mode") || "",
    });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search handler (debounced)
  const handleSearch = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      window.scrollTo({ top: 0 });
      const filters: FetchClientsParams = {
        search,
        magazin,
        anComanda,
        lunaComanda,
        tipClient,
        smsEnabled,
        mode,
      };
      doSearch(filters);

      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) qs.set(k, v);
      });
      const str = qs.toString();
      router.replace(pathname + (str ? `?${str}` : ""));
    }, 300);
  }, [
    router,
    pathname,
    search,
    magazin,
    anComanda,
    lunaComanda,
    tipClient,
    smsEnabled,
    mode,
    doSearch,
  ]);

  // --- Load more (infinite scroll) ---

  const loadMore = useCallback(async () => {
    if (loadingRef.current || pageRef.current >= MAX_PAGES) return;
    loadingRef.current = true;
    setIsFetchingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const res = await dispatch(
        fetchClients({
          params: { ...filtersRef.current, offset: nextPage, limit: LIMIT },
        }),
      );
      if (res.meta.requestStatus === "fulfilled") {
        const payload = res.payload as FetchClientsResponse;
        if (payload.quantity > 0) {
          pageRef.current = nextPage;
        }
      }
    } finally {
      loadingRef.current = false;
      setIsFetchingMore(false);
    }
  }, [dispatch]);

  // IntersectionObserver trigger ref
  const observerRef = useRef<IntersectionObserver>(undefined);

  const triggerRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !loadingRef.current) loadMore();
        },
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [loadMore],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <PageHeader />
        <SearchToolbar
          search={search}
          magazin={magazin}
          anComanda={anComanda}
          lunaComanda={lunaComanda}
          tipClient={tipClient}
          resources={resources}
          onSearchChange={setSearch}
          onMagazinChange={setMagazin}
          onAnComandaChange={setAnComanda}
          onLunaComandaChange={setLunaComanda}
          onTipClientChange={setTipClient}
          smsEnabled={smsEnabled}
          mode={mode}
          onSmsEnabledChange={setSmsEnabled}
          onModeChange={setMode}
          onSubmit={handleSearch}
        />
        <ClientList
          clients={clients}
          isInitialLoading={isInitialLoading}
          hasMore={hasMore}
          isFetchingMore={isFetchingMore}
          triggerRef={triggerRef}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
