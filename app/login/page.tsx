"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess("¡Cuenta creada! Inicia sesión para continuar");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Login exitoso - guardar token
        localStorage.setItem("from_e_token", data.token);
        localStorage.setItem("from_e_user", JSON.stringify(data.user));
        router.push("/");
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <span className="logo-text">From E</span>
          </div>
          <h1>Iniciar Sesión</h1>
          <p className="subtitle">Bienvenido de vuelta</p>
        </div>

        {success && (
          <div className="success-message">
            <span>✅</span>
            {success}
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{" "}
            <Link href="/register">Regístrate gratis</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          padding: 2rem;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .logo-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        h1 {
          color: white;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
        }

        .success-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .auth-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .auth-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-footer p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .auth-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
