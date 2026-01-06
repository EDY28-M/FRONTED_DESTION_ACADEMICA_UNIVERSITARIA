import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight, Filter } from 'lucide-react';
import { Periodo } from '../../types/estudiante';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: Array<{ label: string; path?: string }>;
  filterComponent?: ReactNode;
  periodoMostrar?: Periodo;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbItems = [],
  filterComponent,
  periodoMostrar
}) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    if (breadcrumbItems.length > 0) {
      return breadcrumbItems;
    }

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [
      { label: 'Alumno', path: '/estudiante/inicio' }
    ];

    if (periodoMostrar) {
      items.push({ label: periodoMostrar.nombre });
    }

    items.push({ label: title });

    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          {filterComponent && (
            <div className="flex items-center gap-3">
              {filterComponent}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link to="/estudiante/inicio" className="hover:text-slate-900 transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              {item.path ? (
                <Link
                  to={item.path}
                  className="hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PageHeader;
