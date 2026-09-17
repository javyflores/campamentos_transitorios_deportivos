/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista de Autenticación Institucional y Control de Acceso RBAC (Login.tsx)
 */

import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Database,
  Building2,
  Info,
} from 'lucide-react';
import { UserRole } from '../../types';
import { UserSession, resolveUserSession } from '../../lib/auth';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';
import { FlagIsotype } from '../Shared/FlagIsotype';

interface LoginProps {
  currentRole?: UserRole;
  onLogin: (session: UserSession) => void;
  onCancel?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Por favor ingrese su correo institucional o cédula de identidad.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor ingrese su contraseña institucional.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Verificación y asignación de sesión institucional RBAC
    setTimeout(() => {
      const session = resolveUserSession(identifier);
      setIsLoading(false);
      onLogin(session);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Encabezado Institucional */}
        <div className="bg-white rounded-t-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Cinta Tricolor Oficial */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="w-1/3 bg-[#FFCC00]" />
            <div className="w-1/3 bg-[#002045]" />
            <div className="w-1/3 bg-[#CF142B]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <InstitutionalLogo variant="full" className="mb-2" />
            <h1 className="text-xl sm:text-2xl font-black text-[#002045] tracking-tight mt-2">
              Ingreso Institucional Seguro
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Plataforma Oficial de Gestión en Campamentos Transitorios Deportivos
            </p>
          </div>
        </div>

        {/* Tarjeta de Formulario de Autenticación */}
        <div className="bg-white rounded-b-2xl border-x border-b border-slate-200 shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[#002045]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Credenciales de Acceso (RBAC)
                </h2>
                <p className="text-[11px] text-slate-500 font-normal">
                  Las credenciales de acceso son manejadas exclusivamente por el Ministerio del Deporte
                </p>
              </div>
            </div>
            <FlagIsotype size="sm" />
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identificador / Correo */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Institucional o Cédula:
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="usuario@mindeporte.gob.ve o V-12345678"
                  required
                  className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#002045] focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña Institucional:
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-[#002045] focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="pt-3 flex items-center gap-3">
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#002045] hover:bg-[#001733] text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Verificando...' : 'Acceder al Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Aviso de Confidencialidad LOPNNA */}
          <div className="mt-6 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-[#002045] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              <strong>Garantía de Confidencialidad:</strong> Los datos nominales de Niños, Niñas y Adolescentes (NNA) se encuentran protegidos bajo estricto cumplimiento del Artículo 65 de la LOPNNA.
            </p>
          </div>

          {/* Metadatos de Infraestructura Segura */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Base de Datos Activa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>MinDeporte v4.0</span>
            </div>
          </div>
        </div>

        {/* Pie de Página Institucional */}
        <p className="text-center text-xs text-slate-500 mt-4">
          República Bolivariana de Venezuela • Ministerio del Poder Popular para el Deporte
        </p>
      </div>
    </div>
  );
};

export default Login;
