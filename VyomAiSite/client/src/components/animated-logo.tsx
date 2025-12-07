import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  variant?: "header" | "login" | "footer" | "admin" | "minimal";
  className?: string;
  showText?: boolean;
}

export function AnimatedLogo({ 
  variant = "header", 
  className,
  showText = true 
}: AnimatedLogoProps) {
  const sizeClasses = {
    header: "h-10 w-auto",
    login: "h-24 w-auto",
    footer: "h-12 w-auto",
    admin: "h-8 w-auto",
    minimal: "h-6 w-auto",
  };

  const containerClasses = {
    header: "gap-3",
    login: "gap-4 flex-col",
    footer: "gap-3",
    admin: "gap-2",
    minimal: "gap-2",
  };

  const glowIntensity = {
    header: "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
    login: "0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3), 0 0 90px rgba(139, 92, 246, 0.1)",
    footer: "0 0 15px rgba(139, 92, 246, 0.3)",
    admin: "0 0 15px rgba(139, 92, 246, 0.3)",
    minimal: "0 0 10px rgba(139, 92, 246, 0.2)",
  };

  return (
    <motion.div 
      className={cn("flex items-center", containerClasses[variant], className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
        
        <motion.div
          className="absolute -inset-1 rounded-lg opacity-0"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{
            background: "linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(249, 115, 22, 0.3), rgba(139, 92, 246, 0.3))",
            filter: "blur(12px)",
          }}
        />

        <motion.img 
          src="/vyomai-logo.png" 
          alt="VyomAi Logo"
          className={cn(
            sizeClasses[variant],
            "relative z-10 object-contain drop-shadow-lg"
          )}
          animate={{
            filter: [
              "brightness(1) drop-shadow(0 0 0px rgba(139, 92, 246, 0))",
              "brightness(1.1) drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))",
              "brightness(1) drop-shadow(0 0 0px rgba(139, 92, 246, 0))",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: glowIntensity[variant],
          }}
        />

        {variant === "login" && (
          <>
            <motion.div
              className="absolute -top-2 -left-2 w-3 h-3 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -top-2 -right-2 w-2 h-2 bg-accent rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}
      </motion.div>

      {showText && variant !== "login" && (
        <motion.span 
          className={cn(
            "font-bold gradient-text font-[Space_Grotesk]",
            variant === "header" && "text-xl",
            variant === "footer" && "text-xl",
            variant === "admin" && "text-lg",
            variant === "minimal" && "text-sm"
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          VyomAi
        </motion.span>
      )}
    </motion.div>
  );
}

export function AnimatedLogoShimmer({ className }: { className?: string }) {
  return (
    <motion.div 
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.img 
        src="/vyomai-logo.png" 
        alt="VyomAi"
        className="h-8 w-auto object-contain"
      />
      <motion.div
        className="absolute inset-0"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 3,
        }}
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
      />
    </motion.div>
  );
}
