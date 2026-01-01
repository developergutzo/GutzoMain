import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Route = '/' | '/T&C' | '/refund_policy' | '/privacy_policy' | '/payment-status' | '/contact' | '/about' | '/checkout' | '/phonepe-soon' | `/vendor/${string}` | `/tracking/${string}`;

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route, state?: any) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('/');

  // Update document title based on route
  const updateDocumentTitle = useCallback((route: Route) => {
    const titles: Record<string, string> = {
      '/': 'Gutzo - Feels lighter',
      '/T&C': 'Terms & Conditions | Gutzo',
      '/refund_policy': 'Refund Policy | Gutzo',
      '/privacy_policy': 'Privacy Policy | Gutzo',
      '/payment-status': 'Payment Status | Gutzo',
      '/contact': 'Contact Us | Gutzo',
      '/about': 'About Us | Gutzo',
      '/partner-with-gutzo': 'Partner with Gutzo',
      '/partner/login': 'Partner Login | Gutzo',
      '/partner/dashboard': 'Kitchen Dashboard | Gutzo',
      '/checkout': 'Checkout | Gutzo',
      '/phonepe-soon': 'PhonePe Integration | Gutzo'
    };
    // Handle vendor route explicitly as it's dynamic
    if (route.startsWith('/vendor/')) {
       document.title = 'Order Online | Gutzo';
    } else if (route.startsWith('/tracking/')) {
        document.title = 'Track Order | Gutzo';
    } else {
       document.title = titles[route] || 'Gutzo';
    }
  }, []);

  // Initialize route from browser URL
  useEffect(() => {
  const path = window.location.pathname as Route;
  const validRoutes: string[] = ['/', '/T&C', '/refund_policy', '/privacy_policy', '/payment-status', '/contact', '/about', '/checkout', '/phonepe-soon'];
    
    // Check if it's a valid static route OR a vendor route OR a tracking route
    if (validRoutes.includes(path) || path.startsWith('/vendor/') || path.startsWith('/tracking/')) {
      // Scroll to top immediately on initial load if not on homepage
      if (path !== '/') {
        window.scrollTo(0, 0);
      }
      setCurrentRoute(path);
      updateDocumentTitle(path);
    }
  }, [updateDocumentTitle]);

  // Navigation function
  const navigate = useCallback((route: Route, state?: any) => {
    if (route !== currentRoute) {
      try {
        // Scroll to top immediately before route change
        window.scrollTo(0, 0);
        // Update browser history
        window.history.pushState(state || {}, '', route);
        // Update state directly (strip query params for matching)
        const path = route.split('?')[0] as Route;
        setCurrentRoute(path);
        updateDocumentTitle(path);
        // Force scroll to top after state update
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      } catch (error) {
        // Fallback to hash routing if pushState fails
        console.warn('Browser history not supported, falling back to hash routing');
        window.scrollTo(0, 0);
        window.location.hash = route === '/' ? '' : route;
        // Force scroll to top after hash change
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    }
  }, [currentRoute, updateDocumentTitle]);

  const goBack = useCallback(() => {
      window.history.back();
      // We rely on popstate event to update the state, which is handled in useEffect below
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
    const path = window.location.pathname as Route;
    const validRoutes: string[] = ['/', '/T&C', '/refund_policy', '/privacy_policy', '/payment-status', '/contact', '/about', '/partner-with-gutzo', '/checkout', '/phonepe-soon'];
      
      if (validRoutes.includes(path) || path.startsWith('/vendor/') || path.startsWith('/tracking/')) {
        window.scrollTo(0, 0);
        setCurrentRoute(path);
        updateDocumentTitle(path);
        // Force scroll to top after state update
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateDocumentTitle]);

  return (
    <RouterContext.Provider value={{ currentRoute, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}