/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * App.tsx: Orquestador principal modular (estrictamente < 150 líneas).
 */

import React, { useState, useEffect } from 'react';
import { db } from './lib/db';
import { Campamento, EstadoRegional, Familia, Integrante, PerfilDeportivo, InventarioDeportivo, RutaTransporte, PasajeroRuta, UserRole } from './types';
import { Header } from './components/Layout/Header';
import { Sidebar, ViewType } from './components/Layout/Sidebar';
import { Dashboard } from './components/Views/Dashboard';
import { CampamentosView } from './components/Views/CampamentosView';
import { CampCedulaView } from './components/Views/CampCedulaView';
import { FamiliesView } from './components/Views/FamiliesView';
import { CensusNNAView } from './components/Views/CensusNNAView';
import { SportsView } from './components/Views/SportsView';
import { InventoryView } from './components/Views/InventoryView';
import { RoutesView } from './components/Views/RoutesView';
import { AIAssistantView } from './components/Views/AIAssistantView';
import { ReportsCertificatesView } from './components/Views/ReportsCertificatesView';
import { Login } from './components/Views/Login';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('Administrador');
  const [currentUser, setCurrentUser] = useState({
    name: 'Prof. Carlos Mendoza',
    institution: 'Director de Operaciones',
  });
  const [selectedEstadoId, setSelectedEstadoId] = useState('todos');
  const [selectedCampamentoId, setSelectedCampamentoId] = useState('todos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  const [estados, setEstados] = useState<EstadoRegional[]>([]);
  const [campamentos, setCampamentos] = useState<Campamento[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilDeportivo[]>([]);
  const [inventario, setInventario] = useState<InventarioDeportivo[]>([]);
  const [rutas, setRutas] = useState<RutaTransporte[]>([]);
  const [pasajeros, setPasajeros] = useState<PasajeroRuta[]>([]);

  const loadData = async () => {
    setIsSyncing(true);
    const [est, camp, fam, int, perf, inv, rut, pas, alts] = await Promise.all([
      db.getEstados(), db.getCampamentos(), db.getFamilias(), db.getIntegrantes(),
      db.getPerfiles(), db.getInventario(), db.getRutas(), db.getPasajeros(), db.getAlertas(),
    ]);
    setEstados(est); setCampamentos(camp); setFamilias(fam); setIntegrantes(int);
    setPerfiles(perf); setInventario(inv); setRutas(rut); setPasajeros(pas);
    setAlertCount(alts.length);
    setIsSyncing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleNavigateToCedula = (campId: string) => {
    setSelectedCampamentoId(campId);
    setCurrentView('campcedula');
  };

  if (!isAuthenticated || currentView === 'login') {
    return (
      <Login
        onLogin={(session) => {
          setIsAuthenticated(true);
          setCurrentRole(session.role);
          setCurrentUser({
            name: session.name,
            institution: session.institution,
          });
          setCurrentView('dashboard');
        }}
        onCancel={isAuthenticated ? () => setCurrentView('dashboard') : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#002045] selection:text-white">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onRefreshData={loadData}
        isSyncing={isSyncing}
        alertCount={alertCount}
        onOpenAlerts={() => setCurrentView('reports')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenLogin={() => {
          setIsAuthenticated(false);
          setCurrentView('dashboard');
        }}
        userName={currentUser.name}
        userInstitution={currentUser.institution}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView} onViewChange={setCurrentView} campamentos={campamentos} estados={estados}
          selectedCampamentoId={selectedCampamentoId} onSelectCampamento={setSelectedCampamentoId}
          selectedEstadoId={selectedEstadoId} onSelectEstado={setSelectedEstadoId}
          isOpenMobile={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard campamentos={campamentos} familias={familias} integrantes={integrantes} perfiles={perfiles} onNavigateToView={setCurrentView} />
            )}
            {currentView === 'campamentos' && (
              <CampamentosView campamentos={campamentos} estados={estados} selectedEstadoId={selectedEstadoId} onSelectCampamento={setSelectedCampamentoId} onNavigateToCedula={handleNavigateToCedula} />
            )}
            {currentView === 'campcedula' && (
              <CampCedulaView campamentos={campamentos} estados={estados} familias={familias} integrantes={integrantes} selectedCampamentoId={selectedCampamentoId === 'todos' ? campamentos[0]?.id || '' : selectedCampamentoId} onSelectCampamento={setSelectedCampamentoId} onNavigateToFamilias={() => setCurrentView('familias')} />
            )}
            {currentView === 'familias' && (
              <FamiliesView familias={familias} integrantes={integrantes} campamentos={campamentos} currentRole={currentRole} onSaveFamilia={async (f) => { await db.saveFamilia(f); loadData(); }} onSaveIntegrante={async (i) => { await db.saveIntegrante(i); loadData(); }} />
            )}
            {currentView === 'census_nna' && (
              <CensusNNAView integrantes={integrantes} familias={familias} campamentos={campamentos} currentRole={currentRole} onSaveIntegrante={async (i) => { await db.saveIntegrante(i); loadData(); }} />
            )}
            {currentView === 'sports' && (
              <SportsView perfiles={perfiles} integrantes={integrantes} currentRole={currentRole} onSavePerfil={async (p) => { await db.savePerfil(p); loadData(); }} />
            )}
            {currentView === 'inventory' && (
              <InventoryView inventario={inventario} campamentos={campamentos} currentRole={currentRole} onSaveInventario={async (item) => { await db.saveInventario(item); loadData(); }} />
            )}
            {currentView === 'routes' && (
              <RoutesView
                rutas={rutas}
                pasajeros={pasajeros}
                integrantes={integrantes}
                campamentos={campamentos}
                currentRole={currentRole}
                onToggleAsistencia={async (rId, iId) => { await db.toggleAsistenciaPasajero(rId, iId); loadData(); }}
                onSaveRuta={async (r) => { await db.saveRuta(r); loadData(); }}
                onAddPasajero={async (p) => { await db.addPasajero(p); loadData(); }}
                onDeletePasajero={async (rId, iId) => { await db.deletePasajero(rId, iId); loadData(); }}
              />
            )}
            {currentView === 'reports' && (
              <ReportsCertificatesView campamentos={campamentos} estados={estados} familias={familias} integrantes={integrantes} perfiles={perfiles} inventario={inventario} rutas={rutas} pasajeros={pasajeros} currentRole={currentRole} selectedCampamentoId={selectedCampamentoId} />
            )}
            {currentView === 'ai_assistant' && <AIAssistantView currentRole={currentRole} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
