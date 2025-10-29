import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  serviceName?: string;
  serviceDescription?: string;
}

const SEOHead = ({ 
  title = 'منصة الشحن الذكية', 
  description = 'منصة شحن ذكية وموثوقة', 
  image, 
  url,
  type = "website",
  serviceName,
  serviceDescription 
}: SEOHeadProps) => {
  let siteUrl = '';
  let fullUrl = '';
  try {
    siteUrl = window.location.origin || '';
    fullUrl = url || window.location.href || '';
  } catch (err) {
    console.error('Error getting URLs:', err);
    siteUrl = '';
    fullUrl = url || '';
  }
  
  const ogImage = image?.startsWith('http') 
    ? image 
    : (siteUrl ? `${siteUrl}${image || '/og-aramex.jpg'}` : (image || '/og-aramex.jpg'));
  
  const finalTitle = serviceName ? `${serviceName} - ${title}` : title;
  const finalDescription = serviceDescription || description;
  
  // Update document title and meta tags for better SEO
  React.useEffect(() => {
    document.title = finalTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', finalDescription);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', finalTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', finalDescription);
    }
    
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', fullUrl);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', finalTitle);
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', finalDescription);
    }
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', ogImage);
    }
    
    const twitterImageAlt = document.querySelector('meta[name="twitter:image:alt"]');
    if (twitterImageAlt) {
      twitterImageAlt.setAttribute('content', finalTitle);
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', fullUrl);
    }
  }, [finalTitle, finalDescription, ogImage, fullUrl]);
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="نظام الدفع الآمن" />
      <meta property="og:locale" content="ar_AR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="" />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Arabic" />
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEOHead;
