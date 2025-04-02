import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HouseProvider } from './contexts/HouseContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import PaintRecords from './pages/PaintRecords';
import HomeServices from './pages/HomeServices';
import PlantInventory from './pages/PlantInventory';
import HouseReminders from './pages/HouseReminders';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HouseProvider>
          <Navigation>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/paint-records" element={<PaintRecords />} />
              <Route path="/home-services" element={<HomeServices />} />
              <Route path="/plant-inventory" element={<PlantInventory />} />
              <Route path="/house-reminders" element={<HouseReminders />} />
            </Routes>
          </Navigation>
        </HouseProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
