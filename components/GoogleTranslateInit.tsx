"use client";

import { useEffect } from "react";
import { languages } from "@/lib/consts";

export default function GoogleTranslateInit() {
  useEffect(() => {
    const includedLangs = languages.map((l) => l.code).join(",");

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: includedLangs,
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    const existing = document.getElementById("google-translate-script");
    if (existing) return;

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}