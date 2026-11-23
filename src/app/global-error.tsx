"use client";

import { useEffect } from "react";

/** Last-resort recovery if the root layout itself fails. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[VietWards] Root layout error", error); }, [error]);
  return <html lang="vi"><body style={{ fontFamily: "Arial, sans-serif", background: "#f5f8fd", color: "#16314c", margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
    <main style={{ maxWidth: 470, background: "white", border: "1px solid #d8e4ef", borderRadius: 20, padding: 30 }}>
      <h1>VietWards gặp lỗi khi mở ứng dụng</h1>
      <p>Hãy thử tải lại hoặc quay về trang chủ. Nếu lỗi chỉ xảy ra khi mở bản đồ, có thể nguồn GIS bên ngoài đang gián đoạn.</p>
      <button type="button" onClick={reset} style={{ padding: "12px 18px", borderRadius: 10, border: 0, background: "#155eef", color: "#fff", marginRight: 12, cursor: "pointer" }}>Thử lại</button>
      <button type="button" onClick={() => window.location.assign("/")} style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid #bccfe2", background: "white", color: "#155eef", cursor: "pointer" }}>Trang chủ</button>
    </main>
  </body></html>;
}
