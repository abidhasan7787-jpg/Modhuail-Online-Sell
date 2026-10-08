import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/store/CartDrawer';
import { ToastContainer } from './components/common/Toast';

// Customer Pages
import { HomePage } from './components/pages/HomePage';
import { ShopPage } from './components/pages/ShopPage';
import { ProductPage } from './components/pages/ProductPage';
import { CartPage } from './components/pages/CartPage';
import { CheckoutPage } from './components/pages/CheckoutPage';
import { OrderSuccessPage } from './components/pages/OrderSuccessPage';
import { AccountPage } from './components/pages/AccountPage';
import { AuthPages } from './components/pages/AuthPages';
import { TrackOrderPage } from './components/pages/TrackOrderPage';
import { WishlistPage } from './components/pages/WishlistPage';
import { CMSPages } from './components/pages/CMSPages';

// Admin Panel
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminCoupons } from './components/admin/AdminCoupons';
import { AdminBanners } from './components/admin/AdminBanners';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminActivityLogs } from './components/admin/AdminActivityLogs';
import { QAAuditPanel } from './components/admin/QAAuditPanel';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminSecurity } from './components/admin/AdminSecurity';

import { ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();

  // Route State: route = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'order-success' | 'account' | 'login' | 'register' | 'track-order' | 'wishlist' | 'page' | 'admin'
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);

  // Admin sub-tab: 'dashboard' | 'products' | 'orders' | 'categories' | 'coupons' | 'banners' | 'settings' | 'activity' | 'qa-audit'
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Synchronize with URL hash for browser history & hard refreshes
  useEffect(() => {
    const handleHashChange = () => {
      // Support GitHub Pages SPA 404 redirect (?p=/path)
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get('p');
        if (redirectParam) {
          const cleanRoute = redirectParam.replace(/^\//, '');
          const newUrl = window.location.pathname + '#/' + cleanRoute;
          window.history.replaceState(null, '', newUrl);
        }
      } catch (e) {
        // Ignore URL parsing errors
      }

      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentRoute('home');
        setRouteParam(undefined);
        return;
      }

      const parts = hash.split('/');
      const main = parts[0] || 'home';
      const param = parts[1] || undefined;

      if (main === 'admin') {
        setCurrentRoute('admin');
        if (param && param !== 'login') {
          setAdminTab(param);
        } else {
          setAdminTab('dashboard');
        }
      } else {
        setCurrentRoute(main);
        setRouteParam(param);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    setRouteParam(param);

    if (route === 'admin') {
      const targetTab = param && param !== 'login' ? param : 'dashboard';
      setAdminTab(targetTab);
      window.location.hash = `#/admin/${targetTab}`;
    } else if (param) {
      window.location.hash = `#/${route}/${param}`;
    } else {
      window.location.hash = `#/${route}`;
    }
  };

  // If trying to access admin without admin role or explicitly on /admin/login
  if (currentRoute === 'admin' && (!isAdmin || routeParam === 'login')) {
    return (
      <AdminLoginPage
        onSuccess={() => {
          setCurrentRoute('admin');
          setAdminTab('dashboard');
          window.location.hash = '#/admin/dashboard';
        }}
        onNavigateHome={() => navigateTo('home')}
      />
    );
  }

  // ADMIN VIEW
  if (currentRoute === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          setAdminTab(tab);
          window.location.hash = `#/admin/${tab}`;
        }}
        onNavigateHome={() => navigateTo('home')}
      >
        {adminTab === 'products' ? (
          <AdminProducts />
        ) : adminTab === 'orders' ? (
          <AdminOrders />
        ) : adminTab === 'categories' ? (
          <AdminCategories />
        ) : adminTab === 'coupons' ? (
          <AdminCoupons />
        ) : adminTab === 'banners' ? (
          <AdminBanners />
        ) : adminTab === 'settings' ? (
          <AdminSettings onNavigateTab={(t) => setAdminTab(t)} />
        ) : adminTab === 'security' ? (
          <AdminSecurity />
        ) : adminTab === 'activity' ? (
          <AdminActivityLogs />
        ) : adminTab === 'qa-audit' ? (
          <QAAuditPanel />
        ) : (
          <AdminDashboard onNavigateTab={(t) => setAdminTab(t)} />
        )}
        <ToastContainer />
      </AdminLayout>
    );
  }

  // CUSTOMER STORE VIEW
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <AnnouncementBar />
      <Header onNavigate={navigateTo} currentRoute={currentRoute} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentRoute === 'shop' && <ShopPage initialParam={routeParam} onNavigate={navigateTo} />}
        {currentRoute === 'product' && <ProductPage slug={routeParam || 'prod-001'} onNavigate={navigateTo} />}
        {currentRoute === 'cart' && <CartPage onNavigate={navigateTo} />}
        {currentRoute === 'checkout' && <CheckoutPage onNavigate={navigateTo} />}
        {currentRoute === 'order-success' && <OrderSuccessPage orderId={routeParam || ''} onNavigate={navigateTo} />}
        {currentRoute === 'account' && <AccountPage initialParam={routeParam} onNavigate={navigateTo} />}
        {currentRoute === 'login' && <AuthPages initialMode="login" onNavigate={navigateTo} />}
        {currentRoute === 'register' && <AuthPages initialMode="register" onNavigate={navigateTo} />}
        {currentRoute === 'track-order' && <TrackOrderPage initialParam={routeParam} onNavigate={navigateTo} />}
        {currentRoute === 'wishlist' && <WishlistPage onNavigate={navigateTo} />}
        {currentRoute === 'page' && <CMSPages slug={routeParam || 'about-us'} onNavigate={navigateTo} />}
      </main>

      <Footer onNavigate={navigateTo} />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer onNavigate={navigateTo} />

      {/* Global Notifications */}
      <ToastContainer />

      {/* Floating Admin & QA Quick-Launchers */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            if (!isAdmin) loginAsDemoAdmin();
            navigateTo('admin', 'dashboard');
          }}
          className="group flex items-center gap-2 bg-gradient-to-r from-pink-600 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white px-3.5 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Open MJ Admin Dashboard"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Admin Panel</span>
        </button>

        <button
          onClick={() => {
            if (!isAdmin) loginAsDemoAdmin();
            navigateTo('admin', 'qa-audit');
          }}
          className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-950 text-white px-3 py-2 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md text-xs font-bold transition-all hover:scale-105"
          title="Run Zero-Bug QA Audit"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>QA Audit</span>
        </button>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainApp />
      </StoreProvider>
    </AuthProvider>
  );
}
