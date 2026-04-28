import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VendorLayout from './components/layout/VendorLayout';
import LoginPage from './pages/auth/LoginPage';
import OrgProfilePage from './pages/org/OrgProfilePage';
import StoreListPage from './pages/stores/StoreListPage';
import StoreDetailPage from './pages/stores/StoreDetailPage';
import CreateStorePage from './pages/stores/CreateStorePage';
import StaffListPage from './pages/staff/StaffListPage';
import JobQueuePage from './pages/orders/JobQueuePage';
import JobDetailPage from './pages/orders/JobDetailPage';
import VendorScorePage from './pages/orders/VendorScorePage';
import ProductionPage from './pages/production/ProductionPage';
import EarningsPage from './pages/earnings/EarningsPage';
import PayoutsPage from './pages/earnings/PayoutsPage';
import ClosurePage from './pages/earnings/ClosurePage';
import SupportPage from './pages/support/SupportPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<VendorLayout />}>
        <Route index element={<Navigate to="/orders" replace />} />
        <Route path="org" element={<OrgProfilePage />} />
        <Route path="stores" element={<StoreListPage />} />
        <Route path="stores/new" element={<CreateStorePage />} />
        <Route path="stores/:id" element={<StoreDetailPage />} />
        <Route path="staff" element={<StaffListPage />} />
        <Route path="orders" element={<JobQueuePage />} />
        <Route path="orders/:id" element={<JobDetailPage />} />
        <Route path="score" element={<VendorScorePage />} />
        <Route path="production" element={<ProductionPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="closure" element={<ClosurePage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
