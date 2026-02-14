'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Construction, Wrench, Hammer, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const messages = [
  "Our digital craftspeople are currently polishing this page to perfection.",
  "We're brewing something amazing. Stay tuned!",
  "This page is currently undergoing a high-tech makeover.",
  "Excellence takes time. We're almost there!",
  "Great things are coming. Our team is working hard behind the scenes."
];

const UnderConstruction = ({ 
  title = "Page Under Construction", 
  messageIndex = 0, 
  showBackButton = true,
  customMessage = null 
}) => {
  const displayMessage = customMessage || messages[messageIndex % messages.length];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.05, 0.03] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent rounded-full blur-[100px]"
        />
      </div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass max-w-2xl w-full text-center relative z-10"
      >
        {/* Animated Icons Section */}
        <div className="flex justify-center mb-8 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-full"
          />
          
          <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full text-primary">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Construction size={48} strokeWidth={1.5} />
            </motion.div>
            
            {/* Pulsing sub-icons */}
            <motion.div 
              animate={{ opacity: [0, 1, 0], y: [-10, -20, -10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -top-2 -right-2 bg-background p-1.5 rounded-full shadow-sm border border-border"
            >
              <Wrench size={16} className="text-primary" />
            </motion.div>
            
            <motion.div 
              animate={{ opacity: [0, 1, 0], x: [10, 20, 10] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute top-1/2 -right-4 -translate-y-1/2 bg-background p-1.5 rounded-full shadow-sm border border-border"
            >
              <HardHat size={16} className="text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Text Content */}
        <motion.h1 
          className="heading-lg mb-4 text-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="body-lg mb-8 text-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {displayMessage}
        </motion.p>

        {/* Progress Bar / Loader */}
        <div className="max-w-xs mx-auto mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Building Greatness</span>
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {showBackButton && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/" 
              className="btn-primary flex items-center gap-2 mx-auto w-fit"
            >
              <ArrowLeft size={18} />
              Return to Home
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Logo Backdrop (Subtle) */}
      <motion.div 
        className="absolute bottom-10 right-10 opacity-5 grayscale pointer-events-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src="/Logo.png" alt="" className="h-16 w-auto" />
      </motion.div>
    </div>
  );
};

export default UnderConstruction;
