"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RefreshCw, WifiOff } from "lucide-react";

type DeferredInstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
let deferredInstall: DeferredInstallEvent | null = null;
const INSTALL_CHANGED = "vietwards:install-changed";

/** The app never silently reloads a study session: updates are user-confirmed. */
export function PwaLifecycle() {
  const [offline, setOffline] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [applying, setApplying] = useState(false);
  const userRequestedUpdate = useRef(false);
  useEffect(() => {
    const statusFrame = window.requestAnimationFrame(() => setOffline(!navigator.onLine));
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    const install = (event: Event) => {
      const deferred = event as DeferredInstallEvent;
      if (typeof deferred.prompt !== "function") return;
      event.preventDefault();
      deferredInstall = deferred;
      window.dispatchEvent(new Event(INSTALL_CHANGED));
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineEvent);
    window.addEventListener("beforeinstallprompt", install);
    const changed = () => {
      if (userRequestedUpdate.current) window.location.reload();
    };
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const serviceWorkers = navigator.serviceWorker;
      serviceWorkers.addEventListener("controllerchange", changed);
      let registration: ServiceWorkerRegistration | null = null;
      let cancelled = false;
      const trackWaiting = (reg: ServiceWorkerRegistration) => {
        if (!cancelled && reg.waiting && serviceWorkers.controller) setWaiting(reg.waiting);
      };
      const onUpdateFound = () => {
        const worker = registration?.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && registration) trackWaiting(registration);
        });
      };
      void serviceWorkers.register("/sw.js", { scope: "/" }).then(reg => {
        if (cancelled) return;
        registration = reg;
        trackWaiting(reg);
        reg.addEventListener("updatefound", onUpdateFound);
        // Check for new versions on each fresh navigation, not in a background timer.
        void reg.update().catch(() => {});
      }).catch(() => {});
      return () => {
        cancelled = true;
        if (registration) registration.removeEventListener("updatefound", onUpdateFound);
        serviceWorkers.removeEventListener("controllerchange", changed);
        window.cancelAnimationFrame(statusFrame);
        window.removeEventListener("online", online);
        window.removeEventListener("offline", offlineEvent);
        window.removeEventListener("beforeinstallprompt", install);
      };
    }
    return () => {
      window.cancelAnimationFrame(statusFrame);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineEvent);
      window.removeEventListener("beforeinstallprompt", install);
    };
  }, []);
  const applyUpdate = () => {
    if (!waiting) return;
    userRequestedUpdate.current = true;
    setApplying(true);
    waiting.postMessage({ type: "SKIP_WAITING" });
  };
  if (!offline && !waiting) return null;
  return <div className="vw-system-banner" role="status" aria-live="polite">
    {offline ? <><WifiOff size={18}/><span>Đang ngoại tuyến. Dữ liệu hành chính mới cần Internet.</span></> :
      <><RefreshCw size={18}/><span>Đã có phiên bản VietWards mới.</span>
        <button type="button" disabled={applying} onClick={applyUpdate}>{applying ? "Đang cập nhật…" : "Cập nhật"}</button></>}
  </div>;
}

/** iOS does not support beforeinstallprompt; guide the user without falsely promising installation. */
export function InstallGuide() {
  const [supported, setSupported] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const check = () => {
      setSupported(Boolean(deferredInstall));
      setInstalled(window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
      setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    };
    const frame = window.requestAnimationFrame(check);
    window.addEventListener(INSTALL_CHANGED, check);
    window.addEventListener("appinstalled", check);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener(INSTALL_CHANGED, check); window.removeEventListener("appinstalled", check); };
  }, []);
  const install = async () => {
    const prompt = deferredInstall;
    if (!prompt) return;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === "accepted" ? "Đã tiếp nhận yêu cầu cài đặt." : "Bạn có thể cài đặt sau.");
    } catch { setMessage("Trình duyệt chưa thể mở hộp thoại cài đặt."); }
    deferredInstall = null;
    setSupported(false);
  };
  return <div className="vw-install-card">
    <h3>Cài VietWards lên thiết bị</h3>
    {installed ? <p>VietWards đang chạy ở chế độ ứng dụng độc lập.</p> : <>
      <p>{ios ? "Trên iPhone/iPad: mở bằng Safari, chọn Chia sẻ → Thêm vào Màn hình chính." :
        "Trong trình duyệt hỗ trợ PWA: mở menu và chọn Cài đặt ứng dụng / Thêm vào màn hình chính. Trên PC có thể cài từ biểu tượng cài đặt trên thanh địa chỉ."}</p>
      {supported && <button type="button" onClick={install}><Download size={16} style={{ verticalAlign: "middle", marginRight: 6 }}/> Cài ứng dụng</button>}
      {message && <p role="status">{message}</p>}
    </>}
    <p>Chế độ ngoại tuyến chỉ có trang hướng dẫn và biểu tượng đã lưu. Bản đồ GIS, dữ liệu mới và trang chưa tải vẫn cần kết nối mạng.</p>
  </div>;
}
