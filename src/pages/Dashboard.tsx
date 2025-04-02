import { CalendarIcon, SwatchIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { RiPlantLine } from 'react-icons/ri';
import { LuHammer } from 'react-icons/lu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaintRecords, getHomeServices, getPlants, getReminders, completeReminder } from '../lib/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getThemeClass, ThemeKey } from '../lib/theme';
import { useHouse } from '../contexts/HouseContext';

// Add a helper function for safe date formatting
const formatDate = (date: string | null | undefined) => {
 if (!date) return '';
 try {
  return format(new Date(date), 'MMM d, yyyy');
 } catch {
  return '';
 }
};

export default function Dashboard() {
 const { currentHouse } = useHouse();
 const queryClient = useQueryClient();

 const { data: paintRecords = [] } = useQuery({
  queryKey: ['paintRecords', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getPaintRecords(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const { data: homeServices = [] } = useQuery({
  queryKey: ['homeServices', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getHomeServices(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const { data: plants = [] } = useQuery({
  queryKey: ['plants', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getPlants(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const { data: reminders = [] } = useQuery({
  queryKey: ['reminders', currentHouse?.id],
  queryFn: () => {
   if (!currentHouse?.id) return Promise.resolve([]);
   return getReminders(currentHouse.id);
  },
  enabled: !!currentHouse?.id
 });

 const completeMutation = useMutation({
  mutationFn: completeReminder,
  onSuccess: () => {
   queryClient.invalidateQueries({ queryKey: ['reminders', currentHouse?.id] });
  }
 });

 // Filter for active reminders (not completed)
 const activeReminders = reminders?.filter(reminder => !reminder.completed) ?? [];

 // Filter for upcoming services (scheduled only)
 const upcomingServices = homeServices?.filter(service =>
  service.status === 'scheduled' && new Date(service.date) >= new Date()
 ) ?? [];

 // Combine reminders and services, sort by date
 const combinedReminders = [
  ...activeReminders.map(reminder => ({
   id: reminder.id,
   title: reminder.title,
   date: reminder.dueDate,
   type: 'reminder' as const,
   data: reminder
  })),
  ...upcomingServices.map(service => ({
   id: service.id,
   title: `${service.serviceType?.name || 'Unknown Service Type'} - ${service.provider}`,
   date: service.date,
   type: 'service' as const,
   data: service
  }))
 ].sort((a, b) => {
  const dateA = new Date(a.date || '');
  const dateB = new Date(b.date || '');
  return dateA.getTime() - dateB.getTime();
 }).filter(item => !isNaN(new Date(item.date || '').getTime()));

 // Get most recent items
 const recentPaint = paintRecords[0];
 const recentService = homeServices[0];
 const recentPlant = plants[0];

 const handleCompleteToggle = (id: string) => {
  completeMutation.mutate(id);
 };

 return (
  <div>
   <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

   <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Reminders Section - full width on mobile, 2/3 on desktop */}
    <div className="lg:col-span-2">
     <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
       <div className="flex items-center">
        <div className="flex-shrink-0">
         <CalendarIcon className={`h-6 w-6 ${getThemeClass('reminder', 'icon')}`} aria-hidden="true" />
        </div>
        <div className="ml-5">
         <h3 className="text-lg font-medium text-gray-900">Upcoming</h3>
        </div>
       </div>

       {combinedReminders.length > 0 ? (
        <div className="mt-5">
         <div className="border-t border-gray-200 pt-3">
          {combinedReminders.slice(0, 5).map((item) => {
           const itemTheme = item.type === 'service' ? 'service' as ThemeKey : 'reminder' as ThemeKey;
           return (
            <div
             key={item.id}
             className={`flex items-center justify-between py-2 px-3 rounded-lg mb-2 ${getThemeClass(itemTheme, 'background')}`}
            >
             <div className="flex items-center space-x-3">
              {item.type === 'reminder' ? (
               <>
                <button
                 className="rounded-full p-1 hover:bg-blue-100"
                 onClick={() => handleCompleteToggle(item.id)}
                >
                 <CheckCircleIcon className={`h-5 w-5 ${getThemeClass('reminder', 'icon')}`} aria-hidden="true" />
                </button>
                <span className={`text-sm ${getThemeClass('reminder', 'text')}`}>{item.title}</span>
               </>
              ) : (
               <>
                <div className="rounded-full p-1">
                 <LuHammer className={`h-5 w-5 ${getThemeClass('service', 'icon')}`} aria-hidden="true" />
                </div>
                <span className={`text-sm font-medium ${getThemeClass('service', 'text')}`}>{item.title}</span>
               </>
              )}
             </div>
             <span className={`text-xs ${getThemeClass(itemTheme, 'textLight')}`}>
              {formatDate(item.date)}
             </span>
            </div>
           );
          })}
         </div>
        </div>
       ) : (
        <p className="mt-5 text-sm text-gray-500">No active reminders or upcoming services</p>
       )}
      </div>
      <div className="bg-gray-50 px-5 py-3">
       <div className="text-sm space-x-4">
        <Link to="/house-reminders" className="font-medium text-primary-600 hover:text-primary-900">
         View all reminders
        </Link>
        <Link to="/home-services" className="font-medium text-primary-600 hover:text-primary-900">
         View all services
        </Link>
       </div>
      </div>
     </div>
    </div>

    {/* Recent Section - full width on mobile, 1/3 on desktop */}
    <div className="lg:col-span-1">
     <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
       <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h3>

       {/* Recent Paint */}
       {recentPaint && (
        <div className={`overflow-hidden shadow rounded-lg mb-4 ${getThemeClass('paint', 'background')}`}>
         <div className="p-4">
          <div className="flex items-center">
           <div className="flex-shrink-0">
            <SwatchIcon className={`h-5 w-5 ${getThemeClass('paint', 'icon')}`} aria-hidden="true" />
           </div>
           <div className="ml-3">
            <p className={`text-sm font-medium ${getThemeClass('paint', 'text')}`}>New Paint</p>
            <p className={`text-sm ${getThemeClass('paint', 'textLight')}`}>{recentPaint.colorName}</p>
            <p className="text-xs text-gray-400">{recentPaint.createdAt ? formatDate(recentPaint.createdAt) : ''}</p>
           </div>
          </div>
         </div>
        </div>
       )}

       {/* Recent Service */}
       {recentService && (
        <div className={`overflow-hidden shadow rounded-lg mb-4 ${getThemeClass('service', 'background')}`}>
         <div className="p-4">
          <div className="flex items-center">
           <div className="flex-shrink-0">
            <LuHammer className={`h-5 w-5 ${getThemeClass('service', 'icon')}`} aria-hidden="true" />
           </div>
           <div className="ml-3">
            <p className={`text-sm font-medium ${getThemeClass('service', 'text')}`}>{recentService.serviceType?.name || 'Unknown Service Type'}</p>
            <p className={`text-sm ${getThemeClass('service', 'textLight')}`}>{recentService.provider}</p>
            <p className="text-xs text-gray-400">{formatDate(recentService.date)}</p>
           </div>
          </div>
         </div>
        </div>
       )}

       {/* Recent Plant */}
       {recentPlant && (
        <div className={`overflow-hidden shadow rounded-lg ${getThemeClass('plant', 'background')}`}>
         <div className="p-4">
          <div className="flex items-center">
           <div className="flex-shrink-0">
            <RiPlantLine className={`h-5 w-5 ${getThemeClass('plant', 'icon')}`} aria-hidden="true" />
           </div>
           <div className="ml-3">
            <p className={`text-sm font-medium ${getThemeClass('plant', 'text')}`}>New Plant</p>
            <p className={`text-sm ${getThemeClass('plant', 'textLight')}`}>{recentPlant.name}</p>
            <p className="text-xs text-gray-400">{recentPlant.type}</p>
           </div>
          </div>
         </div>
        </div>
       )}
      </div>
     </div>
    </div>
   </div>
  </div>
 );
} 