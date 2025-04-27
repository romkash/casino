'use client';

import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import MinesGame from "./components/minesGame";
import SpaceCrash from "./components/crash";
import Image from "next/image";
import styles from './HomePage.module.css';

export default function HomePage() {
  const [showMines, setShowMines] = useState(false);
  const [showSpaceCrash, setShowSpaceCrash] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const defaultImage = '/default.jpg';
  const minesImage = '/mines.jpg';
  const spaceCrashImage = '/space-crash.jpg';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleGameClick = (gameId: number) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (gameId === 1) setShowMines(true);
    else if (gameId === 2) setShowSpaceCrash(true);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeGames = () => {
    setShowMines(false);
    setShowSpaceCrash(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  // Остальной код компонента остается без изменений
  // ... (как в вашем исходном коде)

  return (
    <div className={styles.container}>
      {/* Модальное окно авторизации */}
      {showAuthModal && (
        <div className={styles.authModal}>
          <div className={styles.modalContent}>
            <h3>Требуется авторизация</h3>
            <p>Для игры необходимо войти или зарегистрироваться</p>
            <div className={styles.modalButtons}>
              <Link href="/auth/login" className={styles.modalButton}>
                Войти
              </Link>
              <Link href="/auth/register" className={styles.modalButton}>
                Регистрация
              </Link>
              <button 
                onClick={() => setShowAuthModal(false)}
                className={styles.closeButton}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Навигационная панель */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logoWrapper}>
            <Image 
              src="/logo.png" 
              alt="Casino Logo" 
              width={120} 
              height={60}
              className={styles.logoImage}
            />
            <div className={styles.logoTextContainer}>
              <span className={styles.logoMainText}>PREMIUM CASINO</span>
              <span className={styles.logoSubText}>Est. 2024</span>
            </div>
          </div>
          
          <div className={styles.navLinks}>
            <Link href="/promotions" className={styles.navLink}>
              Акции
            </Link>
            <Link href="/tournaments" className={styles.navLink}>
              Турниры
            </Link>
            <Link href="/vip" className={styles.vipLink}>
              VIP Клуб
            </Link>
          </div>

          <div className={styles.authButtons}>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Выйти
              </button>
            ) : (
              <div className={styles.authLinks}>
                <Link href="/auth/login" className={styles.authLink}>
                  Вход
                </Link>
                <Link href="/auth/register" className={styles.registerLink}>
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className={styles.mainContent}>
        {showMines || showSpaceCrash ? (
          <div className={styles.activeGameContainer}>
            <button 
              onClick={closeGames}
              className={styles.backButton}
            >
              ← К списку игр
            </button>
            {showMines && <MinesGame />}
            {showSpaceCrash && <SpaceCrash />}
          </div>
        ) : (
          <>
            <section className={styles.heroSection}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>
                  <span className={styles.heroTitleGlow}>Играйте</span>
                  <span className={styles.heroTitleAccent}>в лучшие азартные игры</span>
                </h1>
                <div className={styles.heroStats}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>$582K</div>
                    <div className={styles.statLabel}>Выплачено за сутки</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>24/7</div>
                    <div className={styles.statLabel}>Поддержка</div>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.gamesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Игровые автоматы</h2>
                <div className={styles.filterButtons}>
                  <button className={styles.filterActive}>Все игры</button>
                  <button>Новые</button>
                  <button>Популярные</button>
                </div>
              </div>
              
              <div className={styles.gamesGrid}>
                {games.map((game) => (
                  <div 
                    key={game.id}
                    className={`${styles.gameCard} ${!isLoggedIn ? styles.disabledCard : ''}`}
                    onClick={() => handleGameClick(game.id)}
                  >
                    <div className={styles.gameCardInner}>
                      <div className={styles.imageContainer}>
                        <Image 
                          src={game.image}
                          alt={game.name}
                          fill
                          className={styles.gameImage}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = defaultImage;
                          }}
                          unoptimized
                        />
                        <div className={styles.gameOverlay}>
                          <button className={styles.playButton}>
                            Играть сейчас
                            <svg className={styles.playIcon} viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className={styles.cardContent}>
                        <h3>{game.name}</h3>
                        <div className={styles.gameInfo}>
                          <span className={styles.rating}>★ 4.9</span>
                          <span className={styles.playersOnline}>🟢 124 онлайн</span>
                        </div>
                        {!isLoggedIn && (
                          <div className={styles.lockOverlay}>
                            <div className={styles.lockContent}>
                              🔒 Требуется авторизация
                              <div className={styles.lockButtons}>
                                <Link href="/auth/login" className={styles.lockButton}>
                                  Войти
                                </Link>
                                <Link href="/auth/register" className={styles.lockButtonAlt}>
                                  Регистрация
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerColumns}>
          <div className={styles.footerColumn}>
            <h4>О нас</h4>
            <p>Лучшие азартные игры с 2010 года</p>
            <div className={styles.socialLinks}>
              <Link href="#"><span>📘 Facebook</span></Link>
              <Link href="#"><span>📸 Instagram</span></Link>
              <Link href="#"><span>💬 Telegram</span></Link>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4>Игры</h4>
            <ul className={styles.footerList}>
              <li><Link href="#">Слоты</Link></li>
              <li><Link href="#">Рулетка</Link></li>
              <li><Link href="#">Блэкджек</Link></li>
              <li><Link href="#">Покер</Link></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Поддержка</h4>
            <ul className={styles.footerList}>
              <li><Link href="#">Правила</Link></li>
              <li><Link href="#">Безопасность</Link></li>
              <li><Link href="#">Платежи</Link></li>
              <li><Link href="#">Контакты</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} PREMIUM CASINO. Все права защищены.</p>
          <div className={styles.legalLinks}>
            <Link href="#">Политика конфиденциальности</Link>
            <Link href="#">Условия использования</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}