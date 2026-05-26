import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useData";

export const SiteSettingsInjector = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Apply Site Name or Site Title to Title
    const siteTitle = settings.site_title || settings.site_name || "Plataforma de Rifas";
    if (siteTitle) {
      document.title = siteTitle;
      
      // Update Meta Tags
      const metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) metaTitle.setAttribute('content', siteTitle);
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', siteTitle);
    }

    // Apply Primary Color
    if (settings.primary_color) {
      const hex = settings.primary_color;
      const hsl = hexToHsl(hex);
      if (hsl) {
        // Shadcn UI uses HSL values separated by spaces: "H S% L%"
        document.documentElement.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        document.documentElement.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
        
        // Add RGB for transparency use
        const rgb = hexToRgb(hex);
        if (rgb) {
          document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
      }
      
      // Update favicon if site_favicon_url or site_logo_url is present
      const logoUrl = settings.site_favicon_url || settings.site_logo_url;
      if (logoUrl) {
        
        // Update all icon types
        const iconTypes = ["icon", "shortcut icon", "apple-touch-icon"];
        
        iconTypes.forEach(type => {
          let link = document.querySelector(`link[rel~='${type}']`) as HTMLLinkElement;
          if (link) {
            link.href = logoUrl;
          } else {
            link = document.createElement('link');
            link.rel = type;
            link.href = logoUrl;
            document.head.appendChild(link);
          }
        });
      }
    }
    
    // Apply other visual settings
    if (settings.button_glow_speed) document.documentElement.style.setProperty('--button-glow-speed', `${settings.button_glow_speed}s`);
    if (settings.title_shimmer_speed) document.documentElement.style.setProperty('--title-shimmer-speed', `${settings.title_shimmer_speed}s`);
    if (settings.border_shimmer_opacity) document.documentElement.style.setProperty('--border-shimmer-opacity', settings.border_shimmer_opacity);
    if (settings.animation_easing) document.documentElement.style.setProperty('--animation-easing', settings.animation_easing);
    if (settings.button_glow_intensity) document.documentElement.style.setProperty('--button-glow-intensity', settings.button_glow_intensity);
    if (settings.title_shimmer_primary) document.documentElement.style.setProperty('--title-shimmer-primary', settings.title_shimmer_primary);
    
    // Logo Height
    if (settings.site_logo_height) document.documentElement.style.setProperty('--logo-height-desktop', `${settings.site_logo_height}px`);
    if (settings.site_logo_height_mobile) document.documentElement.style.setProperty('--logo-height-mobile', `${settings.site_logo_height_mobile}px`);


  }, [settings]);

  return null;
};

function hexToHsl(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse r, g, b
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null;
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return null;
  }
  return { r, g, b };
}