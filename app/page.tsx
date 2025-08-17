"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './landing.module.css';

export default function LandingPage() {
  const [showSpicy, setShowSpicy] = useState(false);
  const [showTrueFanz, setShowTrueFanz] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const spicyTimer = setTimeout(() => setShowSpicy(true), 1000);
    const trueFanzTimer = setTimeout(() => setShowTrueFanz(true), 3000);
    const buttonTimer = setTimeout(() => setShowButton(true), 4000);

    return () => {
      clearTimeout(spicyTimer);
      clearTimeout(trueFanzTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnter = () => {
    router.push('/home');
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <svg
          className={styles.logo}
          width="200"
          height="200"
          viewBox="0 0 128 128"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M118.44 56.41L71.59 9.56a12.78 12.78 0 00-15.18 0L9.56 56.41a12.78 12.78 0 000 15.18l46.85 46.85a12.78 12.78 0 0015.18 0l46.85-46.85a12.78 12.78 0 000-15.18zM99.6 67.27a8.52 8.52 0 01-8.52 8.52H69.34v21.74a8.52 8.52 0 01-10.65 8.13 8.4 8.4 0 01-6.4-8.13V75.79H30.55a8.52 8.52 0 010-17h21.74V37a8.52 8.52 0 0117.04 0v21.75h21.75a8.52 8.52 0 018.52 8.52z"
            fill="#FF0000"
          />
        </svg>
      </div>
      {showSpicy && (
        <p className={`${styles.text} ${styles.fadeIn}`}>
          When Chiliz meets fans, we turn spicy green
        </p>
      )}
      {showTrueFanz && (
        <h1 className={`${styles.trueFanz} ${styles.fadeIn}`}>trueFanz</h1>
      )}
      {showButton && (
        <button className={`${styles.button} ${styles.fadeIn}`} onClick={handleEnter}>
          Enter
        </button>
      )}
    </div>
  );
}
