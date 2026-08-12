import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import './Layouts.css';

export const MainContent = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const pageVariants = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' } },
    exit: { opacity: 0, y: prefersReducedMotion ? 0 : -6, transition: { duration: prefersReducedMotion ? 0 : 0.12, ease: 'easeIn' } },
  };

  return (
    <main className="app-main-content" id="main-content" tabIndex={-1}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="app-page-wrapper"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default MainContent;
