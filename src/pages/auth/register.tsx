import React, { useState } from "react";
import { 
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword
} from "../../firebase";
import Link from "next/link";
import styles from './Auth.module.css';
import Image from "next/image";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Регистрация успешна
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("Этот email уже зарегистрирован");
          break;
        case 'auth/invalid-email':
          setError("Неверный формат email");
          break;
        case 'auth/weak-password':
          setError("Пароль должен содержать минимум 6 символов");
          break;
        default:
          setError("Ошибка регистрации");
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Вход через Google успешен
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2 className={styles.authTitle}>Создать аккаунт</h2>
          <div className={styles.logo}>CASINO ROYALE</div>
        </div>

        <form onSubmit={handleEmailSignUp} className={styles.authForm}>
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
              placeholder="Введите пароль (минимум 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className={styles.authInput}
              required
              minLength={6}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Подтвердите пароль</label>
            <input
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              className={styles.authInput}
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.authButton}>
            Зарегистрироваться
          </button>
        </form>

        <div className={styles.socialAuth}>
          <p className={styles.socialDivider}>Или войдите через</p>
          
          <button 
            onClick={handleGoogleSignUp}
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
          Уже есть аккаунт? <Link href="/auth/login" className={styles.authLink}>Войти</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;