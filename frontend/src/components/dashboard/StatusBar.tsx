import React from 'react';

const palette: Record<string, { bar: string; label: string }> = {
  pending: { bar: 'bg-gray-300', label: 'Pending' },
  shortlisted: { bar: 'bg-accent-400', label: 'Shortlisted' },
  appointed: { bar: 'bg-blue-500', label: 'Hired' },
  rejected: { bar: 'bg-rose-400', label: 'Rejected' },
  student: { bar: 'bg-blue-500', label: 'Students' },
  alumni: { bar: 'bg-accent-400', label: 'Alumni' },
  employer: { bar: 'bg-indigo-500', label: 'Employers' },
  admin: { bar: 'bg-rose-500', label: 'Admins' },
};

/** Segmented horizontal bar with a legend. */
const StatusBar: React.FC<{ counts: Record<string, number>; keys: string[] }> = ({ counts, keys }) => {
  const total = keys.reduce((s, k) => s + (counts[k] || 0), 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100" role="img" aria-label="Distribution">
        {total > 0 &&
          keys.map((k) => {
            const v = counts[k] || 0;
            return v ? <div key={k} className={palette[k].bar} style={{ width: `${(v / total) * 100}%` }} title={`${palette[k].label}: ${v}`} /> : null;
          })}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {keys.map((k) => (
          <li key={k} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${palette[k].bar}`} />
            <span className="text-gray-600">{palette[k].label}</span>
            <span className="ml-auto font-semibold text-gray-900">{counts[k] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusBar;
