import { Wifi, WifiOff, CheckCircle, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
type MessageStatus = 'sending' | 'delivered' | 'processing' | 'completed' | 'failed' | 'retry';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  error?: string;
  retryCount?: number;
  onRetry?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface ProcessingProgressProps {
  stage: string;
  progress?: number;
  isVisible: boolean;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-5 h-5'
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export function ConnectionStatusIndicator({ 
  status, 
  showText = true, 
  size = 'md',
  className = '' 
}: ConnectionStatusIndicatorProps) {
  const iconClass = sizeClasses[size];
  const textClass = textSizes[size];

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className={iconClass} />,
          text: 'Connected',
          color: 'text-green-600'
        };
      case 'connecting':
        return {
          icon: <div className={`${iconClass} animate-spin rounded-full border-2 border-yellow-600 border-t-transparent`} />,
          text: 'Connecting...',
          color: 'text-yellow-600'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className={iconClass} />,
          text: 'Offline',
          color: 'text-gray-500'
        };
      case 'error':
        return {
          icon: <XCircle className={iconClass} />,
          text: 'Error',
          color: 'text-red-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <motion.div 
      className={`flex items-center space-x-1 ${config.color} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {config.icon}
      {showText && (
        <span className={`font-medium ${textClass}`}>
          {config.text}
        </span>
      )}
    </motion.div>
  );
}

export function MessageStatusIndicator({ 
  status, 
  error, 
  retryCount, 
  onRetry,
  size = 'md' 
}: MessageStatusIndicatorProps) {
  const iconClass = sizeClasses[size];

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Clock className={`${iconClass} text-yellow-500 animate-pulse`} />
          </motion.div>
        );
      case 'delivered':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle className={`${iconClass} text-green-500`} />
          </motion.div>
        );
      case 'processing':
        return (
          <div className={`${iconClass} animate-spin rounded-full border-2 border-blue-500 border-t-transparent`} />
        );
      case 'completed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle className={`${iconClass} text-green-600`} />
          </motion.div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1">
            <XCircle className={`${iconClass} text-red-500`} />
            {onRetry && (
              <button
                onClick={onRetry}
                className={`${textSizes[size]} text-red-500 hover:text-red-700 underline flex items-center space-x-1 transition-colors`}
                title="Retry message"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        );
      case 'retry':
        return (
          <div className={`${iconClass} animate-spin rounded-full border-2 border-orange-500 border-t-transparent`} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center">
      {getStatusIcon()}
      
      {/* Retry count badge */}
      {retryCount && retryCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center"
        >
          {retryCount}
        </motion.div>
      )}
      
      {/* Error tooltip */}
      {error && status === 'failed' && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-red-600 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
          <div className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-600"></div>
        </div>
      )}
    </div>
  );
}

export function ProcessingProgress({ stage, progress, isVisible }: ProcessingProgressProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 pt-3 border-t border-stone-100"
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
        <span className="text-sm text-stone-600">{stage}</span>
      </div>
      
      <div className="w-full bg-stone-200 rounded-full h-2">
        <motion.div
          className="bg-stone-600 h-2 rounded-full"
          style={{ 
            width: progress ? `${progress}%` : '60%'
          }}
          animate={{ 
            width: progress ? `${progress}%` : ['30%', '70%', '60%']
          }}
          transition={{ 
            duration: progress ? 0.3 : 2,
            repeat: progress ? 0 : Infinity,
            repeatType: progress ? undefined : 'reverse'
          }}
        />
      </div>
    </motion.div>
  );
}