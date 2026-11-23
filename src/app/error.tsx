"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Diagnostic stays local to the browser; no personal data is sent to third parties.
    console.error("[VietWards] Route error", error);
  }, [error]);
  return <section className="vw-error-panel" role="alert">
    <AlertTriangle size={27} aria-hidden="true"/>
    <h1>Không thể hiển thị nội dung</h1>
    <p>Một phần VietWards gặp lỗi khi tải hoặc hiển thị. Bạn có thể thử lại; các danh mục khác vẫn có thể truy cập. Nếu bản đồ GIS không tải được, hãy thử tìm địa phương bằng danh sách.</p>
    <div className="vw-error-actions">
      <button type="button" onClick={reset}><RotateCcw size={17}/> Thử lại</button>
      <Link href="/"><Home size={17}/> Trang chủ</Link>
    </div>
  </section>;
}
