import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useData";

export const SiteSettingsInjector = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Apply Site Name to Title
    if (settings.site_name) {
      document.title = settings.site_name;
      
      // Update Meta Tags
      const metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) metaTitle.setAttribute('content', settings.site_name);
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', settings.site_name);
    }

    // Apply Primary Color
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
      
      // We might also want to set the hsl values for shadcn if needed
      // but simpler is to just override the variable if the components use var(--primary)
      
      // Optional: Update favicon if site_logo_url is present
      if (settings.site_logo_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = settings.site_logo_url;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = settings.site_logo_url;
          document.head.appendChild(newLink);
        }
      }
    }
  }, [settings]);

  return null;
};