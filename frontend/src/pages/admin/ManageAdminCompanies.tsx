import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BadgeCheck, Building2, ExternalLink, Search, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { EmptyState, PageContainer, PageHeader, PageLoader } from '../../components/ui';

interface CompanyRow {
  _id: string;
  name: string;
  industry?: string;
  headquarters?: string;
  isVerified?: boolean;
  openPositions?: number;
  createdAt?: string;
}

const ManageAdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/companies', { params: { page, limit: 12, search: query || undefined } });
      setCompanies(res.data.companies || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not load companies');
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (c: CompanyRow) => {
    if (!window.confirm(`Delete “${c.name}”? This cannot be undone.`)) return;
    try {
      await axios.delete(`/companies/${c._id}`);
      toast.success('Company deleted');
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not delete company');
    }
  };

  return (
    <DashboardLayout>
      <PageContainer>
        <PageHeader
          title="Companies"
          subtitle={`${total} company profiles across the platform.`}
          icon={<Building2 className="h-5 w-5" />}
        />

        <div className="card mb-4 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by company name"
              className="w-full py-2.5 pl-10 pr-3"
              aria-label="Search companies"
            />
          </div>
        </div>

        {loading ? (
          <PageLoader label="Loading companies" />
        ) : companies.length === 0 ? (
          <div className="card"><EmptyState title="No companies found" description="Try a different search." /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Industry</th>
                    <th className="px-5 py-3">Headquarters</th>
                    <th className="px-5 py-3">Open roles</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        <span className="inline-flex items-center gap-1.5">
                          {c.name}
                          {c.isVerified && <BadgeCheck className="h-4 w-4 text-blue-600" aria-label="Verified" />}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{c.industry || '–'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c.headquarters || '–'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c.openPositions ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Link to={`/companies/${c._id}`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-700" aria-label={`View ${c.name}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button onClick={() => remove(c)} className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${c.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-sm">
                <span className="text-gray-500">Page {page} of {pages}</span>
                <div className="flex gap-2">
                  <button className="btn-secondary !py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                  <button className="btn-secondary !py-1.5 disabled:opacity-50" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
};

export default ManageAdminCompanies;
