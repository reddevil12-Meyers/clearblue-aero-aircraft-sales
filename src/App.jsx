import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import PublicHome from './pages/public/Home';
import PublicInventory from './pages/public/Inventory';
import PublicAircraftDetail from './pages/public/AircraftDetail';
import PublicSellYourPlane from './pages/public/SellYourPlane';
import AircraftEntryForm from './pages/public/AircraftEntryForm';
import PublicInsurance from './pages/public/Insurance';
import PublicAbout from './pages/public/About';
import PublicContact from './pages/public/Contact';
import PublicMaintenance from './pages/public/Maintenance';
import Dashboard from './pages/Dashboard';
import Aircraft from './pages/Aircraft';
import AircraftDetail from './pages/AircraftDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Appraisals from './pages/Appraisals';
import AppraisalDetail from './pages/AppraisalDetail.jsx';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only redirect to login for private routes
      const path = window.location.pathname;
      const isPublicPath = path === '/' || path.startsWith('/public');
      if (!isPublicPath) {
        navigateToLogin();
      }
      return null;
    }
  }

  // Render the main app (private routes only)
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/aircraft" element={<Aircraft />} />
        <Route path="/aircraft/:id" element={<AircraftDetail />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/appraisals" element={<Appraisals />} />
        <Route path="/appraisals/:id" element={<AppraisalDetail />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/deals/:id" element={<DealDetail />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Public routes — no auth required */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/public" element={<PublicHome />} />
              <Route path="/public/inventory" element={<PublicInventory />} />
              <Route path="/public/inventory/:id" element={<PublicAircraftDetail />} />
              <Route path="/public/sell" element={<PublicSellYourPlane />} />
              <Route path="/public/sell/single-engine" element={<AircraftEntryForm engineType="single" />} />
              <Route path="/public/sell/twin-engine" element={<AircraftEntryForm engineType="twin" />} />
              <Route path="/public/insurance" element={<PublicInsurance />} />
              <Route path="/public/about" element={<PublicAbout />} />
              <Route path="/public/contact" element={<PublicContact />} />
              <Route path="/public/maintenance" element={<PublicMaintenance />} />
            </Route>
            {/* Private routes — auth required */}
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App