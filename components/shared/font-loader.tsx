"use client";

import { useEffect } from "react";

export function FontLoader() {
  useEffect(() => {
    // Verificar se os links já existem
    const existingLinks = document.querySelectorAll(
      'link[href*="fonts.googleapis.com"]'
    );
    if (existingLinks.length > 0) {
      return; // Já foram carregados
    }

    // Adicionar preconnect para melhor performance
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    // Adicionar link das fontes
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Raleway:wght@300;400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
  }, []);

  return null;
}
