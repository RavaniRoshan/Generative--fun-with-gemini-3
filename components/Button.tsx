import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'icon';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold border-2 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neo-blue text-white shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]",
    secondary: "bg-neo-white text-black shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]",
    icon: "bg-neo-yellow text-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] p-2 rounded-full",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const roundedClass = variant === 'icon' ? "rounded-full" : "rounded-lg";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${roundedClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;