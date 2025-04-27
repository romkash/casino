import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { auth, googleProvider } from "../../firebase";
import Link from "next/link";
import styles from './Auth.module.css';
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError("Пользователь не найден");
          break;
        case 'auth/wrong-password':
          setError("Неверный пароль");
          break;
        default:
          setError("Ошибка входа");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2 className={styles.authTitle}>Вход в аккаунт</h2>
          <div className={styles.logo}>CASINO ROYALE</div>
        </div>

        <form onSubmit={handleEmailLogin} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className={styles.authInput}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Пароль</label>
            <input
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className={styles.authInput}
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.authButton}>
            Войти
          </button>
        </form>

        <div className={styles.socialAuth}>
          <p className={styles.socialDivider}>Или войдите через</p>
          
          <button 
            onClick={handleGoogleLogin}
            className={styles.googleButton}
          >
            <Image 
              src="/google-icon.png" 
              alt="Google" 
              width={24} 
              height={24}
            />
            Продолжить с Google
          </button>
        </div>

        <div className={styles.authFooter}>
          Нет аккаунта? <Link href="/auth/register" className={styles.authLink}>Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;