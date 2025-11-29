"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Bell, User, Moon, Sun, Settings, HelpCircle, LogOut, UserCircle } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  logout: () => void;
}

const Header = ({ logout }: HeaderProps) => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-50 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search or type command..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                />
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none">
          <div className="flex items-center gap-2 2xsm:gap-3">
            <div className="relative">
              <button
                className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-brand-500"></span>
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                </span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80 z-50">
                  <div className="px-4 py-3">
                    <h5 className="text-sm font-medium text-bodydark2">Notificaciones</h5>
                  </div>

                  <ul className="flex h-auto flex-col overflow-y-auto">
                    <li>
                      <Link
                        className="flex flex-col gap-2.5 border-t border-stroke px-4 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                        href="#"
                      >
                        <p className="text-sm">
                          <span className="text-black dark:text-white">
                            No hay nuevas notificaciones
                          </span>
                        </p>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center gap-4 cursor-pointer"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-black dark:text-white">Admin User</span>
                <span className="block text-xs text-gray-500">Administrador</span>
              </span>
              <span className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="h-6 w-6 text-gray-500" />
              </span>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2.5 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark z-50">
                <div className="px-4 py-3 border-b border-stroke dark:border-strokedark">
                  <h5 className="text-sm font-medium text-bodydark2">Configuración</h5>
                </div>

                <ul className="flex flex-col overflow-y-auto">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:bg-gray-2 dark:hover:bg-meta-4 w-full text-left"
                    >
                      {theme === "dark" ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                      {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                    </button>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:bg-gray-2 dark:hover:bg-meta-4"
                    >
                      <UserCircle className="w-5 h-5" />
                      Editar Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:bg-gray-2 dark:hover:bg-meta-4"
                    >
                      <Settings className="w-5 h-5" />
                      Configuración de Cuenta
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:bg-gray-2 dark:hover:bg-meta-4"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Soporte
                    </Link>
                  </li>
                  <li className="border-t border-stroke dark:border-strokedark">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:bg-gray-2 dark:hover:bg-meta-4 w-full text-left text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
