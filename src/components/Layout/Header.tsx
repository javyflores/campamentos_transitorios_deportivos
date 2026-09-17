/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Membrete oficial y barra superior con control de perfil RBAC institucional.
 */

import React from 'react';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';
import { FlagIsotype } from '../Shared/FlagIsotype';
import { UserRole } from '../../types';
import { AVAILABLE_ROLES } from '../../lib/auth';
import { UserCheck, RefreshCw, Shield, Bell, Menu, X, LogIn, UserCircle } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  onRefreshData?: () => void;
  isSyncing?: boolean;
  alertCount?: number;
  onOpenAlerts?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onOpenLogin?: () => void;
  userName?: string;
  userInstitution?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onRefreshData,
  isSyncing = false,
  alertCount = 0,
  onOpenAlerts,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  onOpenLogin,
  userName = 'Prof. Carlos Mendoza',
  userInstitution = 'Director de Operaciones',
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Barra superior de cinta tricolor sutil */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FFCC00]" />
        <div className="w-1/3 bg-[#002045]" />
        <div className="w-1/3 bg-[#CF142B]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 gap-3">
          {/* Membrete Oficial del Ministerio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onToggleMobileMenu && (
                <button
                  id="btn-toggle-sidebar-mobile"
                  onClick={onToggleMobileMenu}
                  className="lg:hidden p-2 text-slate-600 hover:text-[#002045] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  title="Abrir menú de navegación"
                  aria-label="Abrir menú de navegación"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              )}
              <InstitutionalLogo variant="full" />
            </div>
            
            {/* Botón sincronizar en móvil */}
            <div className="flex md:hidden items-center gap-2">
              {onRefreshData && (
                <button
                  id="btn-sync-mobile"
                  onClick={onRefreshData}
                  disabled={isSyncing}
                  className="p-2 text-slate-500 hover:text-[#002045] rounded-lg border border-slate-200"
                  title="Sincronizar datos"
                  aria-label="Sincronizar datos"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#002045]' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Selector de Rol RBAC e Identidad de Usuario */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
            {/* Indicador de Conexión y Sincronización */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Base de Datos Activa</span>
              {onRefreshData && (
                <button
                  id="btn-sync-desktop"
                  onClick={onRefreshData}
                  disabled={isSyncing}
                  className="ml-1 p-1 text-slate-400 hover:text-[#002045] transition-colors"
                  title="Refrescar y sincronizar"
                  aria-label="Refrescar y sincronizar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Botón de Alertas Tempranas Operativas */}
            {onOpenAlerts && (
              <button
                id="btn-header-alerts"
                onClick={onOpenAlerts}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200/80"
                title="Centro de Alertas Tempranas Operativas"
                aria-label="Ver alertas tempranas"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white shadow-xs animate-pulse">
                    {alertCount}
                  </span>
                )}
              </button>
            )}

            {/* Switcher de Roles RBAC para control institucional */}
            <div className="flex items-center gap-2 bg-slate-100/90 rounded-lg p-1 border border-slate-200">
              <div className="flex items-center gap-1.5 pl-2 pr-1 text-xs text-[#002045] font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#002045]" />
                <span className="hidden lg:inline">Rol Activo:</span>
              </div>
              <select
                id="select-user-role"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="text-xs bg-white text-slate-800 font-semibold py-1 px-2.5 rounded-md border border-slate-200 shadow-xs focus:ring-2 focus:ring-[#002045] focus:outline-hidden cursor-pointer"
                aria-label="Seleccionar rol de usuario para control de acceso"
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Avatar Institucional y Bandera */}
            <div className="flex items-center gap-2 pl-2">
              <FlagIsotype size="sm" />
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[10px] text-slate-500">{userInstitution}</p>
              </div>
              {onOpenLogin && (
                <button
                  id="btn-header-login"
                  onClick={onOpenLogin}
                  className="p-1.5 text-slate-500 hover:text-[#002045] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors ml-1"
                  title="Cambiar de usuario o autenticarse"
                  aria-label="Cambiar de usuario o autenticarse"
                >
                  <UserCircle className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
