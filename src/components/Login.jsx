import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowLeft, LogIn } from 'lucide-react';
import { adminEmail, auth, hasFirebaseConfig } from '../lib/firebase.js';

function Login({ currentUser, isAdmin }) {
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!auth) {
      setError('Firebase 尚未配置 / Firebase is not configured.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回仓库 / Back
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-cyan-700">
            管理员登录 / Admin Login
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            修改仓库数据
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            所有人可查看，只有管理员邮箱可以写入 Firestore。
          </p>
        </div>

        {!hasFirebaseConfig ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            请先复制 `.env.example` 为 `.env` 并填写 Firebase 配置。
          </div>
        ) : null}

        {currentUser && !isAdmin ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            当前账号不是管理员：{currentUser.email}
          </div>
        ) : null}

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            邮箱 / Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              required
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            密码 / Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              required
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? '登录中 / Signing in...' : '登录 / Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
