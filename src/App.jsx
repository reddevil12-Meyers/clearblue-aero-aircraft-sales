import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import PublicHome from './pages/public/Home';
import PublicInventory from './pages/public/Inventory';
import PublicAircraftDetail from './pages/public/AircraftDetail';
import PublicSellYourPlane from './pages/public/SellYourPlane';
import AircraftEntryForm from './pages/public/AircraftEntryForm';
import PublicInsurance from './pages/public/Insurance';
import PublicAbout from './pages/public/About';
import PublicNews from './pages/public/News';
import PublicNewsArticle from './pages/public/NewsArticle';
import PublicContact from './pages/public/Contact';
import PublicMaintenance from './pages/public/Maintenance';
import EstateAircraft from './pages/public/EstateAircraft';
import GardnerTransition from './pages/public/GardnerTransition';
import GardnerAircraft from './pages/public/GardnerAircraft';
import Dashboard from './pages/Dashboard';
import Aircraft from './pages/Aircraft';
import AircraftDetail from './pages/AircraftDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Appraisals from './pages/Appraisals';
import AppraisalDetail from './pages/AppraisalDetail.jsx';
import Deals from './pages/Deals';
import DealDetail from './pages/DealDetail';
import Users from './pages/Users';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import AffiliateProgram from './pages/public/AffiliateProgram';
import AffiliateDashboard from './pages/AffiliateDashboard';
import Affiliates from './pages/Affiliates';
import Subscribers from './pages/Subscribers';
import MarketReports from './pages/MarketReports';
import Employees from './pages/Employees';
import AircraftAssistant from './pages/AircraftAssistant';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app (private routes only)
  return (
    <Routes>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
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
          <Route path="/users" element={<Users />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/announcements/:id" element={<AnnouncementDetail />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/market-reports" element={<MarketReports />} />
          <Route path="/aircraft-assistant" element={<AircraftAssistant />} />
          <Route path="/gardneraircraft" element={<GardnerAircraft />} />
        </Route>
        <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public routes — no auth required */}
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth/consent" element={<OAuthConsent />} />

            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/inventory" element={<PublicInventory />} />
              <Route path="/inventory/:id" element={<PublicAircraftDetail />} />
              <Route path="/sell" element={<PublicSellYourPlane />} />
              <Route path="/sell/single-engine" element={<AircraftEntryForm engineType="single" />} />
              <Route path="/sell/twin-engine" element={<AircraftEntryForm engineType="twin" />} />
              <Route path="/insurance" element={<PublicInsurance />} />
              <Route path="/about" element={<PublicAbout />} />
              <Route path="/news" element={<PublicNews />} />
              <Route path="/news/:id" element={<PublicNewsArticle />} />
              <Route path="/contact" element={<PublicContact />} />
              <Route path="/maintenance" element={<PublicMaintenance />} />
              <Route path="/estate-aircraft" element={<EstateAircraft />} />
              <Route path="/gardner" element={<GardnerTransition />} />
              <Route path="/affiliate-program" element={<AffiliateProgram />} />
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