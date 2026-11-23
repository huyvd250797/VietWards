import Link from "next/link";
import { MapPinOff, Home, Map } from "lucide-react";
export default function NotFound() {
  return <section className="vw-error-panel">
    <MapPinOff size={27} aria-hidden="true"/>
    <h1>Không tìm thấy trang</h1>
    <p>Đường dẫn bạn mở không tồn tại trong phiên bản VietWards hiện tại. Hãy mở trang chủ hoặc tiếp tục khám phá bản đồ.</p>
    <div className="vw-error-actions"><Link href="/"><Home size={17}/> Trang chủ</Link><Link href="/ban-do"><Map size={17}/> Bản đồ Việt Nam</Link></div>
  </section>;
}
