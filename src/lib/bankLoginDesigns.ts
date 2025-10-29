// Bank login page design configurations
// Mimicking official bank login pages with exact styling, colors, fonts, and spacing

export interface BankLoginDesign {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  inputBackgroundColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  linkColor: string;
  
  // Logo and Images
  logo?: string;
  backgroundImage?: string;
  backgroundPattern?: string;
  
  // Typography
  fontFamily: string;
  fontSize: {
    title: string;
    subtitle: string;
    body: string;
    small: string;
    input: string;
    button: string;
  };
  fontWeight: {
    title: number;
    subtitle: number;
    body: number;
    button: number;
  };
  
  // Spacing
  spacing: {
    containerPadding: string;
    inputMarginBottom: string;
    buttonMarginTop: string;
    sectionGap: string;
  };
  
  // Input styles
  inputStyles: {
    borderRadius: string;
    borderWidth: string;
    borderColor: string;
    height: string;
    padding: string;
  };
  
  // Button styles
  buttonStyles: {
    borderRadius: string;
    height: string;
    padding: string;
    boxShadow: string;
  };
  
  // Layout
  layout: {
    maxWidth: string;
    direction: 'rtl' | 'ltr';
    logoPosition: 'top' | 'center' | 'left';
    logoSize?: {
      width: string;
      height: string;
    };
    containerPadding?: string;
    formMaxWidth?: string;
  };
  
  // Placeholder text
  placeholders: {
    username: string;
    customerId: string;
    phone: string;
    password: string;
  };
  
  // Labels
  labels: {
    username: string;
    customerId: string;
    phone: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    loginButton: string;
    registerLink: string;
  };
}

const defaultDesign: BankLoginDesign = {
  primaryColor: '#006C35',
  secondaryColor: '#004A2C',
  backgroundColor: '#FFFFFF',
  textColor: '#333333',
  inputBackgroundColor: '#FFFFFF',
  buttonColor: '#006C35',
  buttonHoverColor: '#005029',
  linkColor: '#0066CC',
  fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  fontSize: {
    title: '28px',
    subtitle: '16px',
    body: '14px',
    small: '12px',
    input: '16px',
    button: '16px',
  },
  fontWeight: {
    title: 700,
    subtitle: 500,
    body: 400,
    button: 600,
  },
  spacing: {
    containerPadding: '24px',
    inputMarginBottom: '16px',
    buttonMarginTop: '24px',
    sectionGap: '32px',
  },
  inputStyles: {
    borderRadius: '6px',
    borderWidth: '1px',
    borderColor: '#CCCCCC',
    height: '48px',
    padding: '12px 16px',
  },
  buttonStyles: {
    borderRadius: '6px',
    height: '48px',
    padding: '12px 24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  layout: {
    maxWidth: '400px',
    direction: 'rtl',
    logoPosition: 'center',
  },
  placeholders: {
    username: 'أدخل اسم المستخدم',
    customerId: 'أدخل رقم العميل',
    phone: '05XXXXXXXX',
    password: 'أدخل كلمة المرور',
  },
  labels: {
    username: 'اسم المستخدم',
    customerId: 'رقم العميل',
    phone: 'رقم الجوال',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    loginButton: 'تسجيل الدخول',
    registerLink: 'تسجيل حساب جديد',
  },
};

export const BANK_LOGIN_DESIGNS: Record<string, BankLoginDesign> = {
  // Saudi Arabia Banks
  alrajhi_bank: {
    ...defaultDesign,
    primaryColor: '#006C35',
    secondaryColor: '#004A2C',
    backgroundColor: '#F8F9FA',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#006C35',
    buttonHoverColor: '#004A2C',
    linkColor: '#006C35',
    fontFamily: '"Tahoma", "Arial", "Helvetica Neue", sans-serif',
    fontSize: {
      title: '26px',
      subtitle: '14px',
      body: '14px',
      small: '12px',
      input: '15px',
      button: '16px',
    },
    fontWeight: {
      title: 700,
      subtitle: 600,
      body: 400,
      button: 600,
    },
    spacing: {
      containerPadding: '0px',
      inputMarginBottom: '18px',
      buttonMarginTop: '20px',
      sectionGap: '28px',
    },
    inputStyles: {
      borderRadius: '4px',
      borderWidth: '1px',
      borderColor: '#D1D5DB',
      height: '48px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '4px',
      height: '48px',
      padding: '12px 32px',
      boxShadow: '0 2px 4px rgba(0,108,53,0.2)',
    },
    layout: {
      maxWidth: '100%',
      direction: 'rtl',
      logoPosition: 'center',
      logoSize: {
        width: '200px',
        height: '70px',
      },
      containerPadding: '0',
      formMaxWidth: '420px',
    },
    placeholders: {
      username: 'اسم المستخدم أو رقم الهوية',
      customerId: 'رقم العميل',
      phone: '05XXXXXXXX',
      password: '••••••••',
    },
    labels: {
      username: 'اسم المستخدم / رقم الهوية',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'دخول',
      registerLink: 'فتح حساب جديد',
    },
  },
  
  alahli_bank: {
    ...defaultDesign,
    primaryColor: '#00843D',
    secondaryColor: '#00662F',
    backgroundColor: '#FFFFFF',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#00843D',
    buttonHoverColor: '#00662F',
    fontFamily: '"Arial", "Helvetica", sans-serif',
    inputStyles: {
      borderRadius: '8px',
      borderWidth: '1px',
      borderColor: '#E0E0E0',
      height: '48px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '8px',
      height: '48px',
      padding: '12px 32px',
      boxShadow: '0 4px 12px rgba(0,132,61,0.25)',
    },
    labels: {
      username: 'اسم المستخدم',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'هل نسيت كلمة المرور؟',
      loginButton: 'تسجيل الدخول',
      registerLink: 'إنشاء حساب',
    },
  },
  
  riyad_bank: {
    ...defaultDesign,
    primaryColor: '#0066B2',
    secondaryColor: '#004D87',
    backgroundColor: '#F8F9FA',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#0066B2',
    buttonHoverColor: '#004D87',
    fontFamily: '"Segoe UI", "Tahoma", sans-serif',
    inputStyles: {
      borderRadius: '6px',
      borderWidth: '1px',
      borderColor: '#CED4DA',
      height: '46px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '6px',
      height: '46px',
      padding: '12px 28px',
      boxShadow: '0 2px 6px rgba(0,102,178,0.2)',
    },
    placeholders: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: '05XXXXXXXX',
      password: 'أدخل كلمة المرور',
    },
    labels: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'دخول',
      registerLink: 'التسجيل',
    },
  },
  
  samba_bank: {
    ...defaultDesign,
    primaryColor: '#E31E24',
    secondaryColor: '#C0171C',
    backgroundColor: '#FFFFFF',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#E31E24',
    buttonHoverColor: '#C0171C',
    fontFamily: '"Arial", sans-serif',
    inputStyles: {
      borderRadius: '5px',
      borderWidth: '1px',
      borderColor: '#D5D5D5',
      height: '48px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '5px',
      height: '48px',
      padding: '12px 32px',
      boxShadow: '0 3px 10px rgba(227,30,36,0.3)',
    },
    labels: {
      username: 'اسم المستخدم',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'تسجيل الدخول',
      registerLink: 'تسجيل جديد',
    },
  },
  
  // UAE Banks
  emirates_nbd: {
    ...defaultDesign,
    primaryColor: '#D50032',
    secondaryColor: '#B0002A',
    backgroundColor: '#FFFFFF',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#D50032',
    buttonHoverColor: '#B0002A',
    fontFamily: '"Arial", "Helvetica", sans-serif',
    inputStyles: {
      borderRadius: '4px',
      borderWidth: '1px',
      borderColor: '#D0D0D0',
      height: '50px',
      padding: '14px 16px',
    },
    buttonStyles: {
      borderRadius: '4px',
      height: '50px',
      padding: '14px 32px',
      boxShadow: '0 2px 8px rgba(213,0,50,0.25)',
    },
    labels: {
      username: 'اسم المستخدم',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'تسجيل الدخول',
      registerLink: 'إنشاء حساب',
    },
  },
  
  // Kuwait Banks
  nbk: {
    ...defaultDesign,
    primaryColor: '#005EB8',
    secondaryColor: '#004A94',
    backgroundColor: '#F5F5F5',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#005EB8',
    buttonHoverColor: '#004A94',
    fontFamily: '"Arial", sans-serif',
    inputStyles: {
      borderRadius: '6px',
      borderWidth: '1px',
      borderColor: '#CCCCCC',
      height: '48px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '6px',
      height: '48px',
      padding: '12px 32px',
      boxShadow: '0 2px 6px rgba(0,94,184,0.25)',
    },
    placeholders: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: '05XXXXXXXX',
      password: '••••••',
    },
    labels: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'دخول',
      registerLink: 'التسجيل',
    },
  },
  
  // Qatar Banks
  qnb: {
    ...defaultDesign,
    primaryColor: '#6E1D3E',
    secondaryColor: '#5A1833',
    backgroundColor: '#FFFFFF',
    inputBackgroundColor: '#FFFFFF',
    buttonColor: '#6E1D3E',
    buttonHoverColor: '#5A1833',
    fontFamily: '"Arial", "Helvetica", sans-serif',
    inputStyles: {
      borderRadius: '4px',
      borderWidth: '1px',
      borderColor: '#D0D0D0',
      height: '48px',
      padding: '12px 16px',
    },
    buttonStyles: {
      borderRadius: '4px',
      height: '48px',
      padding: '12px 32px',
      boxShadow: '0 2px 8px rgba(110,29,62,0.25)',
    },
    placeholders: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: '05XXXXXXXX',
      password: 'كلمة المرور',
    },
    labels: {
      username: 'رقم العميل',
      customerId: 'رقم العميل',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      loginButton: 'دخول',
      registerLink: 'فتح حساب جديد',
    },
  },
};

// Get design for a bank, fallback to default
export const getBankLoginDesign = (bankId: string): BankLoginDesign => {
  return BANK_LOGIN_DESIGNS[bankId] || defaultDesign;
};
