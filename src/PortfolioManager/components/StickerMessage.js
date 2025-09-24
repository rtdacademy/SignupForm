import React from 'react';
import { Card } from '../../components/ui/card';
import {
  Trophy,
  Star,
  Heart,
  Sparkles,
  Target,
  Rocket,
  ThumbsUp,
  Award,
  Crown,
  Medal,
  Zap,
  Flame
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StickerMessage = ({ message, isAuthor }) => {
  // Map icon names to components
  const iconMap = {
    Trophy,
    Star,
    Heart,
    Sparkles,
    Target,
    Rocket,
    ThumbsUp,
    Award,
    Crown,
    Medal,
    Zap,
    Flame
  };

  const Icon = iconMap[message.sticker?.icon] || Star;
  const stickerData = message.sticker || {
    message: 'Great!',
    color: 'from-purple-400 to-pink-500'
  };

  return (
    <div
      className={cn(
        'flex',
        isAuthor ? 'justify-end' : 'justify-start',
        'animate-in zoom-in-95 duration-300'
      )}
    >
      <Card
        className={cn(
          'relative overflow-hidden p-2 max-w-[150px]',
          'transform transition-all duration-300 hover:scale-105',
          'bg-gradient-to-br',
          stickerData.color || 'from-purple-400 to-pink-500'
        )}
      >
        {/* Sparkle decorations */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 rounded-full blur-lg" />
        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white/20 rounded-full blur-lg" />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-1">
          {/* Animated icon container */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-pulse" />
            <div className={cn(
              'relative p-1.5 bg-white/90 rounded-full shadow-md',
              'animate-bounce'
            )}>
              <Icon className="w-5 h-5 text-gray-800" />
            </div>
          </div>

          {/* Message text */}
          <h3 className="text-xs font-bold text-white text-center drop-shadow">
            {stickerData.message}
          </h3>

          {/* Author info */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              message.authorRole === 'facilitator' ? 'bg-green-400' : 'bg-blue-400'
            )} />
            <span className="text-[10px] font-medium text-white/90">
              {message.authorRole === 'facilitator' ? 'F' : 'P'}
            </span>
          </div>

          {/* Custom text if provided */}
          {message.content && (
            <p className="text-[10px] text-white/90 text-center italic mt-1">
              "{message.content}"
            </p>
          )}
        </div>

        {/* Animated particles */}
        <div className="absolute top-1 right-1">
          <Sparkles className="w-2 h-2 text-white/60 animate-spin-slow" />
        </div>
        <div className="absolute bottom-1 left-1">
          <Sparkles className="w-1.5 h-1.5 text-white/40 animate-spin-slow-reverse" />
        </div>
      </Card>
    </div>
  );
};

export default StickerMessage;