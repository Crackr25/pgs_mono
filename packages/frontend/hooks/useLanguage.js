import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('language', languageCode);
  };

  // Simple translation function - in a real app, this would use i18n
  const translate = (key) => {
    const translations = {
      en: {
        dashboard: 'Dashboard',
        products: 'Products',
        orders: 'Orders',
        quotes: 'Quotes',
        messages: 'Messages',
        analytics: 'Analytics',
        payments: 'Payments',
        tools: 'Tools',
        support: 'Support',
        reputation: 'Reputation',
        onboarding: 'Onboarding',
        welcome: 'Welcome to Supplier Marketplace',
        logout: 'Logout',
        profile: 'Profile',
        settings: 'Settings'
      },
      tl: {
        dashboard: 'Dashboard',
        products: 'Mga Produkto',
        orders: 'Mga Order',
        quotes: 'Mga Quote',
        messages: 'Mga Mensahe',
        analytics: 'Analytics',
        payments: 'Mga Bayad',
        tools: 'Mga Tool',
        support: 'Suporta',
        reputation: 'Reputasyon',
        onboarding: 'Pag-onboard',
        welcome: 'Maligayang pagdating sa Supplier Marketplace',
        logout: 'Mag-logout',
        profile: 'Profile',
        settings: 'Mga Setting'
      },
      zh: {
        dashboard: '仪表板',
        products: '产品',
        orders: '订单',
        quotes: '报价',
        messages: '消息',
        analytics: '分析',
        payments: '付款',
        tools: '工具',
        support: '支持',
        reputation: '声誉',
        onboarding: '入职',
        welcome: '欢迎来到供应商市场',
        logout: '登出',
        profile: '个人资料',
        settings: '设置'
      },
      es: {
        dashboard: 'Panel',
        products: 'Productos',
        orders: 'Pedidos',
        quotes: 'Cotizaciones',
        messages: 'Mensajes',
        analytics: 'Analíticas',
        payments: 'Pagos',
        tools: 'Herramientas',
        support: 'Soporte',
        reputation: 'Reputación',
        onboarding: 'Incorporación',
        welcome: 'Bienvenido al Mercado de Proveedores',
        logout: 'Cerrar sesión',
        profile: 'Perfil',
        settings: 'Configuración'
      }
    };

    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return { currentLanguage, changeLanguage, translate };
};
