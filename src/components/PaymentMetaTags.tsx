import React from "react";
import { Helmet } from "react-helmet-async";
import { getServiceBranding } from "@/lib/serviceLogos";

interface PaymentMetaTagsProps {
  serviceName: string;
  serviceKey?: string;
  amount?: string;
  title?: string;
  description?: string;
}

const PaymentMetaTags = ({ serviceName, serviceKey, amount, title, description }: PaymentMetaTagsProps) => {
  // Use serviceKey if provided, otherwise try to extract from serviceName
  const actualServiceKey = serviceKey || serviceName?.toLowerCase()?.replace(/\s+/g, '') || 'aramex';
  const branding = getServiceBranding(actualServiceKey);
  
  const ogTitle = title || `${serviceName} - الدفع`;
  // Use company description as primary description when sharing links
  const serviceDescription = branding?.description || `خدمة شحن موثوقة`;
  const ogDescription = description || serviceDescription || `صفحة دفع آمنة ومحمية لخدمة ${serviceName}${amount ? ` - ${amount}` : ''}`;
  
  // Use company-specific OG image or hero image with absolute URL
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const ogImage = branding?.ogImage 
    ? (branding.ogImage.startsWith('http') ? branding.ogImage : `${siteUrl}${branding.ogImage}`)
    : branding?.heroImage
    ? (branding.heroImage.startsWith('http') ? branding.heroImage : `${siteUrl}${branding.heroImage}`)
    : `${siteUrl}/og-aramex.jpg`;
  
  // Get full URL for OG tags
  const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Update document head directly for better bot compatibility
  React.useEffect(() => {
    // Update title
    document.title = ogTitle;
    
    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', ogDescription);
    
    // Update OG tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOrCreateMeta('og:type', 'website');
    updateOrCreateMeta('og:url', fullUrl);
    updateOrCreateMeta('og:title', ogTitle);
    updateOrCreateMeta('og:description', ogDescription);
    updateOrCreateMeta('og:image', ogImage);
    updateOrCreateMeta('og:image:width', '1200');
    updateOrCreateMeta('og:image:height', '630');
    updateOrCreateMeta('og:image:type', 'image/jpeg');
    
    // Update Twitter tags
    const updateOrCreateTwitter = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOrCreateTwitter('twitter:card', 'summary_large_image');
    updateOrCreateTwitter('twitter:title', ogTitle);
    updateOrCreateTwitter('twitter:description', ogDescription);
    updateOrCreateTwitter('twitter:image', ogImage);
  }, [ogTitle, ogDescription, ogImage, fullUrl]);
  
  return (
    <Helmet>
      <title>{ogTitle}</title>
      <meta name="description" content={ogDescription} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content={serviceName} />
      <meta property="og:locale" content="ar_AR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogTitle} />
    </Helmet>
  );
};

export default PaymentMetaTags;
