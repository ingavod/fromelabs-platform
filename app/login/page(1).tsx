"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email o contraseña incorrectos");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <Image 
            src="/logo-from-e.png" 
            alt="From E Systems Logo" 
            width={150}
            height={50}
            priority
            style={{ objectFit: 'contain' }}
          />
          <h1 className="title">From E Labs</h1>
          <p className="subtitle">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="register-link">
          ¿No tienes cuenta? <Link href="/register">Regístrate aquí</Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          padding: 2rem;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(0, 206, 209, 0.3);
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0, 206, 209, 0.2);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .title {
          color: #00CED1;
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          text-shadow: 0 0 20px rgba(0, 206, 209, 0.3);
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .error-message {
          background: rgba(255, 82, 82, 0.1);
          border: 1px solid rgba(255, 82, 82, 0.3);
          color: #ff5252;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #00CED1;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(0, 206, 209, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(0, 206, 209, 0.1);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .btn-submit {
          background: linear-gradient(135deg, #00CED1 0%, #008B8B 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 206, 209, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .register-link {
          text-align: center;
          margin-top: 2rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .register-link a {
          color: #00CED1;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .register-link a:hover {
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0, 206, 209, 0.5);
        }
      `}</style>
    </div>
  );
}
