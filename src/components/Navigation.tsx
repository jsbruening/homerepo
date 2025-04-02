import { Fragment, useState, ReactNode } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { HomeIcon, SwatchIcon, BellIcon, Bars3Icon, XMarkIcon, ChevronDownIcon, HomeModernIcon, PlusIcon } from '@heroicons/react/24/outline';
import { LuHammer } from 'react-icons/lu';
import { RiPlantLine } from 'react-icons/ri';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useHouse } from '../contexts/HouseContext';
import ManageHousesModal from './houses/ManageHousesModal';

interface NavigationProps {
 children: ReactNode;
}

const navigation = [
 { name: 'Dashboard', href: '/', icon: HomeIcon },
 { name: 'Paint', href: '/paint-records', icon: SwatchIcon },
 { name: 'Home Services', href: '/home-services', icon: LuHammer },
 { name: 'Plants', href: '/plant-inventory', icon: RiPlantLine },
 { name: 'House Reminders', href: '/house-reminders', icon: BellIcon },
];

function classNames(...classes: string[]) {
 return classes.filter(Boolean).join(' ');
}

export default function Navigation({ children }: NavigationProps) {
 const location = useLocation();
 const houseContext = useHouse();
 const [isManageHousesOpen, setIsManageHousesOpen] = useState(false);

 // If the context is not available, show a loading state
 if (!houseContext) {
  return (
   <div className="min-h-screen bg-gray-100">
    <div className="flex h-16 items-center justify-center">
     <div className="text-gray-500">Loading...</div>
    </div>
   </div>
  );
 }

 const { currentHouse, houses, setCurrentHouse } = houseContext;

 const HouseSelector = () => (
  <Menu as="div" className="relative">
   <Menu.Button className="flex w-full items-center justify-between gap-2 rounded-md bg-slate-600 px-3 py-2 text-sm text-white hover:bg-slate-700">
    <div className="flex items-center gap-2">
     <HomeModernIcon className="h-5 w-5" />
     <span className="max-w-[150px] truncate">{currentHouse?.name || 'Select House'}</span>
    </div>
    <ChevronDownIcon className="h-4 w-4" />
   </Menu.Button>
   <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
   >
    <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
     <div className="py-1">
      {houses.map((house) => (
       <Menu.Item key={house.id}>
        {({ active }) => (
         <button
          onClick={() => setCurrentHouse(house)}
          className={classNames(
           active ? 'bg-slate-600' : '',
           currentHouse?.id === house.id ? 'bg-slate-800' : '',
           'flex w-full items-center px-4 py-2 text-sm text-white'
          )}
         >
          <HomeModernIcon
           className={classNames(
            'mr-3 h-5 w-5',
            currentHouse?.id === house.id ? 'text-primary-400' : 'text-gray-300'
           )}
          />
          <span className="flex-1 truncate">{house.name}</span>
          {house.owners.length > 0 && (
           <span className="ml-2 text-xs text-gray-300">
            {house.owners[0]}
           </span>
          )}
         </button>
        )}
       </Menu.Item>
      ))}
      <div className="border-t border-slate-600">
       <Menu.Item>
        {({ active }) => (
         <button
          onClick={() => setIsManageHousesOpen(true)}
          className={classNames(
           active ? 'bg-slate-600' : '',
           'flex w-full items-center px-4 py-2 text-sm text-white'
          )}
         >
          <PlusIcon className="mr-3 h-5 w-5 text-gray-300" />
          Manage Houses
         </button>
        )}
       </Menu.Item>
      </div>
     </div>
    </Menu.Items>
   </Transition>
  </Menu>
 );

 return (
  <div className="flex min-h-screen bg-gray-100">
   {/* Mobile menu */}
   <Disclosure as="nav" className="bg-slate-500 lg:hidden">
    {({ open }) => (
     <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-slate-500 shadow-lg">
       <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
         <div className="flex-shrink-0 flex items-center">
          <HomeIcon className="h-6 w-6 text-white mr-2" />
          <span className="text-xl font-bold text-white">Home Repo</span>
         </div>
        </div>
        <div className="flex items-center gap-2">
         <HouseSelector />
         <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-slate-600 focus:outline-none">
          <span className="sr-only">Open main menu</span>
          {open ? (
           <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
           <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
         </Disclosure.Button>
        </div>
       </div>
      </div>

      <Disclosure.Panel className="fixed top-16 left-0 right-0 z-40 bg-slate-500 shadow-lg">
       <div className="flex h-full flex-col">
        <div className="flex-1 space-y-1 px-2 py-4">
         {navigation.map((item) => (
          <Link
           key={item.name}
           to={item.href}
           className={classNames(
            location.pathname === item.href
             ? 'bg-slate-600 text-white'
             : 'text-white hover:bg-slate-600 hover:text-white',
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150'
           )}
          >
           <item.icon
            className={classNames(
             location.pathname === item.href ? 'text-white' : 'text-white group-hover:text-white',
             'mr-3 h-5 w-5 flex-shrink-0'
            )}
            aria-hidden="true"
           />
           {item.name}
          </Link>
         ))}
        </div>
       </div>
      </Disclosure.Panel>
     </>
    )}
   </Disclosure>

   {/* Desktop sidebar */}
   <div className="hidden lg:flex min-h-0 flex-col border-r border-gray-200 bg-slate-500 w-64">
    {/* Header */}
    <div className="flex h-16 items-center px-4 border-b border-slate-400">
     <div className="flex items-center">
      <div className="flex-shrink-0 flex items-center">
       <HomeIcon className="h-6 w-6 text-white mr-2" />
       <span className="text-xl font-bold text-white">Home Repo</span>
      </div>
     </div>
    </div>

    {/* House Selector moved here */}
    <div className="px-2 py-3 w-full">
     <HouseSelector />
    </div>

    {/* Navigation Links */}
    <div className="flex flex-col overflow-y-auto">
     <nav className="space-y-1 px-2 py-4">
      {navigation.map((item) => (
       <Link
        key={item.name}
        to={item.href}
        className={classNames(
         location.pathname === item.href
          ? 'bg-slate-600 text-white'
          : 'text-white hover:bg-slate-600 hover:text-white',
         'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150'
        )}
       >
        <item.icon
         className={classNames(
          location.pathname === item.href ? 'text-white' : 'text-white group-hover:text-white',
          'mr-3 h-5 w-5 flex-shrink-0'
         )}
         aria-hidden="true"
        />
        {item.name}
       </Link>
      ))}
     </nav>
    </div>
   </div>

   {/* Main content wrapper */}
   <div className="flex-1 overflow-auto">
    <main className="h-full py-6">
     <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {children}
     </div>
    </main>
   </div>

   {/* House Management Modal */}
   <ManageHousesModal
    isOpen={isManageHousesOpen}
    onClose={() => setIsManageHousesOpen(false)}
   />
  </div>
 );
} 