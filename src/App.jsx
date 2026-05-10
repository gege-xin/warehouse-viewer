import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LogIn, LogOut, Settings } from 'lucide-react';
import WarehouseMap from './components/WarehouseMap.jsx';
import SearchBar from './components/SearchBar.jsx';
import Legend from './components/Legend.jsx';
import LocationModal from './components/LocationModal.jsx';
import Login from './components/Login.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import LargeTextToggle from './components/LargeTextToggle.jsx';
import LocateProduct from './components/LocateProduct.jsx';
import OccupiedOnlyToggle from './components/OccupiedOnlyToggle.jsx';
import { locationMatches } from './components/LocationCell.jsx';
import { auth, hasFirebaseConfig, isAdminEmail } from './lib/firebase.js';
import { subscribeWarehouseData } from './lib/warehouseService.js';

function countLocations(data) {
  return data.reduce(
    (summary, item) => {
      if (item.type === 'aisle') {
        summary.aisles += 1;
        return summary;
      }

      item.racks?.forEach((rack) => {
        summary.racks += 1;
        summary.total += rack.columns * rack.levels;
        rack.locations?.forEach((location) => {
          summary[location.status] = (summary[location.status] || 0) + 1;
        });
      });

      return summary;
    },
    {
      total: 0,
      racks: 0,
      aisles: 0,
      occupied: 0,
      reserved: 0,
      disabled: 0,
      unassigned: 0,
    },
  );
}

function getSearchResults(data, normalizedSearch) {
  if (!normalizedSearch) return [];

  return data.flatMap((item) => {
    if (item.type !== 'zone') return [];

    return (item.racks || []).flatMap((rack) =>
      (rack.locations || [])
        .filter((location) => locationMatches(location, normalizedSearch))
        .map((location) => ({
          ...location,
          zoneNameCn: item.nameCn,
          zoneNameEn: item.nameEn,
          rackName: rack.rackName,
          rackNameEn: rack.rackNameEn,
        })),
    );
  });
}

function sortSearchResults(results) {
  return [...results].sort((a, b) => {
    const aUnassigned = a.status === 'unassigned' ? 0 : 1;
    const bUnassigned = b.status === 'unassigned' ? 0 : 1;
    return (
      aUnassigned - bUnassigned ||
      String(a.model || '').localeCompare(String(b.model || ''))
    );
  });
}

function App() {
  const [warehouseData, setWarehouseData] = useState([]);
  const [dataError, setDataError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(!auth);

  useEffect(() => {
    const unsubscribe = subscribeWarehouseData(setWarehouseData, (error) => {
      setDataError(error.message);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
  }, []);

  const isAdmin = isAdminEmail(currentUser?.email);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicWarehousePage
            currentUser={currentUser}
            dataError={dataError}
            isAdmin={isAdmin}
            warehouseData={warehouseData}
          />
        }
      />
      <Route
        path="/login"
        element={<Login currentUser={currentUser} isAdmin={isAdmin} />}
      />
      <Route
        path="/admin"
        element={
          authReady && isAdmin ? (
            <AdminPanel
              currentUser={currentUser}
              warehouseData={warehouseData}
            />
          ) : authReady ? (
            <Navigate to="/login" replace />
          ) : (
            <LoadingScreen />
          )
        }
      />
    </Routes>
  );
}

function PublicWarehousePage({ currentUser, dataError, isAdmin, warehouseData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [focusedCode, setFocusedCode] = useState('');
  const [largeText, setLargeText] = useLocalStorageBoolean('largeTextMode', false);
  const [occupiedOnly, setOccupiedOnly] = useLocalStorageBoolean(
    'showOccupiedOnly',
    false,
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const summary = useMemo(() => countLocations(warehouseData), [warehouseData]);
  const searchResults = useMemo(
    () => sortSearchResults(getSearchResults(warehouseData, normalizedSearch)),
    [normalizedSearch, warehouseData],
  );
  const matchCount = searchResults.length;

  useEffect(() => {
    if (!normalizedSearch || searchResults.length === 0) {
      setFocusedCode('');
      return;
    }

    setFocusedCode(searchResults[0].code);
  }, [normalizedSearch, searchResults]);

  return (
    <main
      className={[
        'min-h-screen bg-[#f5f7fb] text-slate-900',
        largeText ? 'large-text-mode' : '',
      ].join(' ')}
    >
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="min-w-0">
            <p className="truncate text-sm font-semibold text-cyan-700">
              仓库货架可视化 / Warehouse Rack Viewer
            </p>
            <h1 className="truncate text-lg font-bold text-slate-950 sm:text-2xl">
              橱柜 / Sink / 建材仓库
            </h1>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            {currentUser && auth ? (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-700"
                aria-label="退出 / Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-700"
                aria-label="管理员登录 / Admin login"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <SearchBar
            largeText={largeText}
            matchCount={matchCount}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <LargeTextToggle enabled={largeText} onChange={setLargeText} />
            <OccupiedOnlyToggle
              enabled={occupiedOnly}
              onChange={setOccupiedOnly}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-2 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        {dataError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            Firestore 读取失败 / Firestore read failed: {dataError}
          </div>
        ) : null}

        {!hasFirebaseConfig ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
            当前使用本地示例数据。配置 Firebase 环境变量后会自动读取 Firestore。
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <WarehouseMap
              data={warehouseData}
              focusedCode={focusedCode}
              largeText={largeText}
              occupiedOnly={occupiedOnly}
              searchTerm={normalizedSearch}
              onSelectLocation={setSelectedLocation}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <LocateProduct
              largeText={largeText}
              results={searchResults}
              searchTerm={searchTerm}
              selectedCode={focusedCode}
              onLocate={setFocusedCode}
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <SummaryCard label="SKU / Locations" value={summary.total} />
              <SummaryCard label="货架 / Racks" value={summary.racks} />
              <SummaryCard label="未分配 / Unassigned" value={summary.unassigned} />
              <SummaryCard label="有货 / Occupied" value={summary.occupied} />
            </div>
            <Legend />
          </aside>
        </section>
      </div>

      <LocationModal
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </main>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-panel">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function useLocalStorageBoolean(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : stored === 'true';
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Keep the UI usable if storage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-sm font-semibold text-slate-700">
      加载中 / Loading...
    </main>
  );
}

export default App;
