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
    <header className="sticky top-0 flex w-full surface-card border-border-subtle z-40 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-border-subtle lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-secondary border border-border-subtle rounded-lg z-50 lg:flex lg:h-11 lg:w-11"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                  <Search className="w-5 h-5 text-muted" />
                </span>
                <input
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-full rounded-lg border border-border-default surface-card py-2.5 pl-12 pr-14 text-sm text-primary shadow-xs placeholder:text-muted focus:border-primary focus:outline-hidden focus:ring-3 focus:ring-primary/10 xl:w-[430px]"
                />
                <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border-default surface-muted px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-muted">
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0">
          <div className="flex items-center gap-2 2xsm:gap-3">
            <div className="relative">
              <button
                className="relative flex items-center justify-center w-10 h-10 text-secondary rounded-lg hover:surface-hover"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Notificaciones"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-brand-500"></span>
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                </span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2.5 flex h-90 w-75 flex-col rounded-lg border border-border-subtle surface-card shadow-lg sm:right-0 sm:w-80 z-50">
                  <div className="px-4 py-3">
                    <h5 className="text-sm font-medium text-secondary">Notificaciones</h5>
                  </div>

                  <ul className="flex h-auto flex-col overflow-y-auto">
                    <li>
                      <Link
                        className="flex flex-col gap-2.5 border-t border-border-subtle px-4 py-3 hover:surface-hover"
                        href="#"
                      >
                        <p className="text-sm">
                          <span className="text-primary dark:text-white">
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
              aria-label="Configuración de usuario"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-primary dark:text-white">Admin User</span>
                <span className="block text-xs text-muted">Administrador</span>
              </span>
              <span className="h-12 w-12 rounded-full surface-muted flex items-center justify-center overflow-hidden">
                <User className="h-6 w-6 text-secondary" />
              </span>
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2.5 flex w-62.5 flex-col rounded-lg border border-border-subtle surface-card shadow-lg z-50">
                <div className="px-4 py-3 border-b border-border-subtle">
                  <h5 className="text-sm font-medium text-secondary">Configuración</h5>
                </div>

                <ul className="flex flex-col overflow-y-auto">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:surface-hover w-full text-left"
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
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:surface-hover"
                    >
                      <UserCircle className="w-5 h-5" />
                      Editar Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:surface-hover"
                    >
                      <Settings className="w-5 h-5" />
                      Configuración de Cuenta
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:surface-hover"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Soporte
                    </Link>
                  </li>
                  <li className="border-t border-border-subtle">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium duration-300 ease-in-out hover:surface-hover w-full text-left text-error"
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
