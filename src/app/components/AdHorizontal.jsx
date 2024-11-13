import { useEffect } from "react";

export default function AdHorizontal() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense script error:", e);
    }
  }, []);

  return (
    <>
      <ins
        class="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-7881518457068083"
        data-ad-slot="9675290059"
      ></ins>
    </>
  );
}
