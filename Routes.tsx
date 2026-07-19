import React, {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard}  useEffect, useState  from 'react';
import {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard}  useTranslation  from 'react-i18next';
import api from '../services/api';

interface Stop {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
  name: string;
  lat: number;
  lng: number;


interface Route {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
  id: string;
  name: string;
  description: string;
  color: string;
  status: string;
  is_active_trip: boolean;
  stops: Stop

const Routes: React.FC = () => {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
  const {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard}  t  = useTranslation();
  const outes, setRoutesoading, setLoading
    loadRoutes();
  , {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
    try {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
      const tenant = localStorage.getItem('tenantId')  'default';
      console.log(' Cargando rutas con tenant:', tenant);
      
      const response = await api.get('/api/v1/routes', {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
        headers: {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
          'x-tenant-id': tenant
        
      );
      
      console.log(' Respuesta completa:', response);
      console.log(' Datos recibidos:', response.data);
      
      // Asegurarse de que los datos estén en la estructura correcta
      const routesData = response.data?.data  response.data   catch (error) {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
      console.error(' Error cargando rutas:', error);
     finally {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
      setLoading(false);
    
  ;

  if (loading) {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} 
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6"> {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} t('routes.title')  'Gestión de Rutas'</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} routes.map((route) => (
          <div key={.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.id className="bg-white rounded-lg shadow p-4 border-l-4" style={.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard}  borderColor: route.color >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.name</h3>
                <p className="text-sm text-gray-500">{.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.description</p>
                <div className="flex items-center mt-2 gap-2">
                  <span className={.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} `px-2 py-1 rounded-full text-xs $route.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'`>
                    {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.status
                  </span>
                  {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.is_active_trip && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                       En servicio
                    </span>
                  )
                </div>
              </div>
              <span className="text-sm text-gray-500"> {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.stops.length paradas</span>
            </div>

            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Paradas:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} route.stops.map((stop, index) => (
                  <span key={.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} index className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">
                    {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} stop.name
                  </span>
                ))
              </div>
            </div>
          </div>
        ))
      </div>

      {.{env,git{,hub,ignore}},AUDITORIA.md,Dockerfile,README.md,backups,c{erts,ontracts},docs,example.env,go.{mod,sum},internal,logs,m{igrations,odulo_{1{0_hr_conductores,1_billetera_multimodal,2_api_publica,3_reportes,_flota},2_usuarios,3_cobro,4_admin,5_{analitica,services.txt},6_cmms,7_clearinghouse,8_crm,9_incidentes}},n{ats-credentials.conf,ginx.conf},prometheus.yml,results-formatted.txt,s{cripts,rc},t{e{mplates,st{_incident.json,s}},o{ken.txt,ols}},web_dashboard} routes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay rutas disponibles
        </div>
      )
    </div>
  );
;

export default Routes;
