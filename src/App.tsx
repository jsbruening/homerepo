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
          <div className="flex h-screen">
            <Navigation />
            <main className="flex-1 overflow-auto">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/paint-records" element={<PaintRecords />} />
                  <Route path="/home-services" element={<HomeServices />} />
                  <Route path="/plant-inventory" element={<PlantInventory />} />
                  <Route path="/house-reminders" element={<HouseReminders />} />
                </Routes>
              </div>
            </main>
          </div>
        </HouseProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
