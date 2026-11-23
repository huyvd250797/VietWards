"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText, GraduationCap, ChevronDown, Compass, Globe2, History, Layers3, Map,
  Menu, Moon, Search, Sun, X, ArrowUpRight, CircleHelp
} from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { APP, PERIODS, type Period } from "@/lib/config";
import { provinceHref } from "@/lib/province-search";
import {
  emptyHistoricalSelection, historicHref, selectionFromParams, singleSelection,
  switchHistoricalPeriod, validateHistoricalSelection, type HistoricalLink, type HistoricalSelection,
} from "@/lib/historical-selection";

type AppContextValue = {
  period: Period; ready: boolean; selectedProvinceCode: string | null;
  historicalSelection: HistoricalSelection;
  changePeriod: (period: Period) => void;
  selectProvince: (code: string | null) => void;
  navigateProvince: (period: Period, code: string | null) => void;
};
const AppContext = createContext<AppContextValue | null>(null);

export function useAtlas() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAtlas must be used within AppShell");
  return value;
}

function registerServiceWorker() {
  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
    // Offline mode is a progressive enhancement; do not interrupt the app.
  });
}

const primaryNav = [
  { href: "/", label: "Tổng quan", icon: Compass },
  { href: "/ban-do", label: "Khám phá bản đồ", icon: Map },
  { href: "/tinh-thanh", label: "Tỉnh thành", icon: Layers3 },
  { href: "/lich-su", label: "Lịch sử sáp nhập", icon: History },
  { href: "/hoc-dia-ly", label: "Học địa lý", icon: GraduationCap },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand ${compact ? "brand-compact" : ""}`} href="/" aria-label="VietWards - Trang tổng quan">
      <span className="brand-mark" aria-hidden="true"><Globe2 size={23} strokeWidth={2.1}/></span>
      <span className="brand-copy"><strong>VietWards<span className="brand-dot">.</span></strong><small>KHÁM PHÁ VIỆT NAM</small></span>
    </Link>
  );
}

export function PeriodToggle({ size = "default" }: { size?: "default" | "large" }) {
  const { period, changePeriod } = useAtlas();
  return (
    <div className={`period-toggle ${size === "large" ? "period-toggle-large" : ""}`} role="group" aria-label="Chọn thời kỳ hành chính">
      <button className={period === "current" ? "selected" : ""} type="button" onClick={() => changePeriod("current")} aria-pressed={period === "current"}>
        Hiện tại <span className="period-count">34</span>
      </button>
      <button className={period === "before" ? "selected" : ""} type="button" onClick={() => changePeriod("before")} aria-pressed={period === "before"}>
        Trước 01/07/2025 <span className="period-count">63</span>
      </button>
    </div>
  );
}

export function AppShell({ children, links }: { children: React.ReactNode; links: HistoricalLink[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [historicalSelection, setHistoricalSelection] = useState<HistoricalSelection>(() => emptyHistoricalSelection());
  const period = historicalSelection.period;
  const selectedProvinceCode = historicalSelection.selectedProvinceCode;
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Query parameters take precedence over previously saved period. Native history
  // updates are supported, including direct links and browser back/forward.
  useEffect(() => {
    function restoreFromUrl(initial = false) {
      const url = new URL(window.location.href);
      const urlPeriod = url.searchParams.get("period");
      let fallback: string | null = null;
      try { fallback = localStorage.getItem("vietwards-period") ?? localStorage.getItem("vietatlas-period"); } catch { /* restricted */ }
      const nextPeriod: Period = urlPeriod === "before" || urlPeriod === "current" ? urlPeriod
        : initial && (fallback === "before" || fallback === "current") ? fallback : "current";
      // Normal client navigation without URL query retains the active selection.
      if (urlPeriod === "before" || urlPeriod === "current" || url.searchParams.has("province") || initial) {
        const restored = selectionFromParams(url.searchParams, nextPeriod);
        setHistoricalSelection(validateHistoricalSelection(restored, links));
      }
      if (initial) {
        try {
          const storedTheme = localStorage.getItem("vietwards-theme") ?? localStorage.getItem("vietatlas-theme");
          const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme
            : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          setTheme(nextTheme);
          document.documentElement.setAttribute("data-theme", nextTheme);
        } catch { /* storage may be restricted */ }
      }
      setReady(true);
    }
    const isFirstLoad = !initialized.current;
    const frame = window.requestAnimationFrame(() => {
      restoreFromUrl(isFirstLoad);
      initialized.current = true;
    });
    const onPopState = () => restoreFromUrl();
    window.addEventListener("popstate", onPopState);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("popstate", onPopState); };
  }, [pathname, links]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      window.addEventListener("load", registerServiceWorker, { once: true });
      // In client transitions, load may have fired already.
      if (document.readyState === "complete") registerServiceWorker();
      return () => window.removeEventListener("load", registerServiceWorker);
    }
  }, []);

  const updateAddress = useCallback((state: HistoricalSelection) => {
    try { localStorage.setItem("vietwards-period", state.period); } catch { /* restricted */ }
    if (typeof window !== "undefined" && ["/ban-do", "/tinh-thanh", "/lich-su"].includes(window.location.pathname)) {
      const path = window.location.pathname as "/ban-do" | "/tinh-thanh" | "/lich-su";
      const url = historicHref(path, state);
      if (window.location.pathname + window.location.search !== url) {
        window.history.replaceState(window.history.state, "", url);
      }
    }
  }, []);
  const navigateProvince = useCallback((nextPeriod: Period, code: string | null) => {
    const next = validateHistoricalSelection(singleSelection(nextPeriod, code), links);
    setHistoricalSelection(next);
    updateAddress(next);
  }, [links, updateAddress]);
  const changePeriod = useCallback((nextPeriod: Period) => {
    const next = validateHistoricalSelection(switchHistoricalPeriod(historicalSelection, nextPeriod, links), links);
    setHistoricalSelection(next);
    updateAddress(next);
  }, [historicalSelection, links, updateAddress]);
  const selectProvince = useCallback((code: string | null) => {
    navigateProvince(period, code);
  }, [navigateProvince, period]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try { localStorage.setItem("vietwards-theme", nextTheme); } catch { /* no storage */ }
  }

  const currentNav = [...primaryNav, { href: "/gioi-thieu", label: "Giới thiệu", icon: BookOpenText }]
    .find((item) => item.href === pathname);

  const renderNav = (closeOnClick = false) => (
    <>
      <div className="sidebar-label">KHÁM PHÁ</div>
      <nav className="nav-stack" aria-label="Điều hướng chính">
        {primaryNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`nav-item ${pathname === href ? "active" : ""}`} aria-current={pathname === href ? "page" : undefined} onClick={closeOnClick ? () => setMobileMenuOpen(false) : undefined}>
            <Icon size={19} strokeWidth={1.9}/><span>{label}</span>{pathname === href && <span className="nav-active-indicator"/>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-label sidebar-label-spaced">THÔNG TIN</div>
      <nav className="nav-stack" aria-label="Thông tin ứng dụng">
        <Link href="/gioi-thieu" className={`nav-item ${pathname === "/gioi-thieu" ? "active" : ""}`} aria-current={pathname === "/gioi-thieu" ? "page" : undefined} onClick={closeOnClick ? () => setMobileMenuOpen(false) : undefined}>
          <BookOpenText size={19} strokeWidth={1.9}/><span>Giới thiệu & roadmap</span>
        </Link>
      </nav>
    </>
  );

  return (
    <AppContext.Provider value={{ period, ready, selectedProvinceCode, historicalSelection, changePeriod, selectProvince, navigateProvince }}>
      <div className="app-frame">
        <aside className="sidebar" aria-label="Thanh điều hướng">
          <div className="sidebar-top"><Logo/><span className="release-pill">BETA 0.9.0</span></div>
          {renderNav()}
          <div className="sidebar-spacer"/>
          <div className="sidebar-progress">
            <div className="progress-caption"><span>Tiến độ dự án</span><strong>9 / 10</strong></div>
            <div className="progress-track"><div className="progress-fill"/></div>
            <p>Học địa lý, so sánh hai tỉnh và quiz. GIS cấp xã cũ chưa hoàn thành, dữ liệu cần tiếp tục kiểm chứng.</p>
            <Link href="/gioi-thieu">Xem lộ trình <ArrowUpRight size={14}/></Link>
          </div>
          <div className="sidebar-foot"><CircleHelp size={15}/> Dữ liệu có kiểm chứng · V{APP.version}</div>
        </aside>

        <div className="main-area">
          <header className="topbar">
            <div className="topbar-left">
              <button className="icon-button mobile-menu-button" type="button" aria-label="Mở menu" onClick={() => setMobileMenuOpen(true)}><Menu size={21}/></button>
              <span className="topbar-mobile-logo"><Logo compact/></span>
              <span className="topbar-breadcrumb desktop-only">VietWards <span>/</span> <strong>{currentNav?.label || "Khám phá"}</strong></span>
            </div>
            <div className="topbar-right">
              <div className="topbar-period desktop-only"><PeriodToggle/></div>
              <button type="button" className="search-trigger desktop-only" title="Mở danh sách tìm kiếm địa phương" onClick={() => router.push(provinceHref("/tinh-thanh", period, selectedProvinceCode))}><Search size={17}/> Tìm tỉnh thành <span>V0.9</span></button>
              <button className="icon-button theme-button" type="button" aria-label={theme === "light" ? "Bật giao diện tối" : "Bật giao diện sáng"} title={theme === "light" ? "Chế độ tối" : "Chế độ sáng"} onClick={toggleTheme}>
                {theme === "light" ? <Moon size={19}/> : <Sun size={19}/>}
              </button>
              <span className="topbar-version">v{APP.version}</span>
            </div>
          </header>
          <main className="page-container" id="main-content">{children}</main>
          <footer className="app-footer"><span>© 2026 VietWards. Xây dựng để học và khám phá địa lý Việt Nam.</span><span>V{APP.version} · {APP.releaseName}</span></footer>
        </div>
        <nav className="bottom-nav" aria-label="Điều hướng nhanh trên điện thoại">
          {primaryNav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`bottom-nav-item ${pathname === href ? "active" : ""}`} aria-current={pathname === href ? "page" : undefined}>
              <Icon size={21} strokeWidth={1.9}/><span>{label === "Khám phá bản đồ" ? "Bản đồ" : label === "Lịch sử sáp nhập" ? "Lịch sử" : label === "Tổng quan" ? "Tổng quan" : label === "Học địa lý" ? "Học" : "Tỉnh thành"}</span>
            </Link>
          ))}
        </nav>
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" role="presentation" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-drawer" role="dialog" aria-label="Menu điều hướng" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="mobile-drawer-top"><Logo/><button className="icon-button" aria-label="Đóng menu" type="button" onClick={() => setMobileMenuOpen(false)}><X size={21}/></button></div>
              {renderNav(true)}
              <div className="mobile-drawer-help"><ChevronDown size={16}/> VietWards v{APP.version} · Educational Experience & QA</div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}
