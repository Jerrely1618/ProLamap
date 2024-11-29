import { useEffect } from "react";

export default function AdVertical() {
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
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7881518457068083"
        data-ad-slot="1223150625"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
