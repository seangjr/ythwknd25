import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Connecting to database...",
  onRetry,
  showRetry = false,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700 text-center font-medium">{message}</p>
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Retry Connection
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 