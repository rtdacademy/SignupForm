import React from 'react';
import { Button } from '../../components/ui/button';
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

const ReactionPopover = ({ onSelectSticker, className }) => {
  const stickers = [
    {
      id: 'trophy',
      icon: Trophy,
      message: 'Great Work!',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'star',
      icon: Star,
      message: 'Excellent!',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'heart',
      icon: Heart,
      message: 'Love This!',
      color: 'from-pink-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-red-50',
      iconColor: 'text-pink-600'
    },
    {
      id: 'sparkle',
      icon: Sparkles,
      message: 'Amazing!',
      color: 'from-blue-400 to-purple-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'target',
      icon: Target,
      message: 'On Target!',
      color: 'from-green-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-blue-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'rocket',
      icon: Rocket,
      message: 'Blast Off!',
      color: 'from-indigo-400 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'thumbsup',
      icon: ThumbsUp,
      message: 'Well Done!',
      color: 'from-blue-400 to-green-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-green-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'award',
      icon: Award,
      message: 'Outstanding!',
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'crown',
      icon: Crown,
      message: 'Champion!',
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'medal',
      icon: Medal,
      message: 'Winner!',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-orange-600'
    },
    {
      id: 'zap',
      icon: Zap,
      message: 'Superb!',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'flame',
      icon: Flame,
      message: 'On Fire!',
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-orange-600'
    }
  ];

  const handleStickerClick = (sticker) => {
    // Get the icon name from our sticker data
    const iconName = sticker.id === 'trophy' ? 'Trophy' :
                     sticker.id === 'star' ? 'Star' :
                     sticker.id === 'heart' ? 'Heart' :
                     sticker.id === 'sparkle' ? 'Sparkles' :
                     sticker.id === 'target' ? 'Target' :
                     sticker.id === 'rocket' ? 'Rocket' :
                     sticker.id === 'thumbsup' ? 'ThumbsUp' :
                     sticker.id === 'award' ? 'Award' :
                     sticker.id === 'crown' ? 'Crown' :
                     sticker.id === 'medal' ? 'Medal' :
                     sticker.id === 'zap' ? 'Zap' :
                     sticker.id === 'flame' ? 'Flame' : 'Star';

    onSelectSticker({
      id: sticker.id,
      icon: iconName,
      message: sticker.message,
      color: sticker.color
    });
  };

  return (
    <div className={cn('w-64', className)}>
      <div className="mb-2">
        <h4 className="text-xs font-medium text-gray-700">Send a Reaction</h4>
        <span className="text-[10px] text-gray-500">Click to send encouragement!</span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {stickers.map((sticker) => {
          const Icon = sticker.icon;
          return (
            <Button
              key={sticker.id}
              variant="ghost"
              onClick={() => handleStickerClick(sticker)}
              className={cn(
                'h-auto p-1 flex flex-col items-center gap-0.5 transition-all duration-200',
                'hover:scale-105 hover:shadow-sm',
                sticker.bgColor,
                'border border-transparent hover:border-gray-200'
              )}
            >
              <div className={cn(
                'p-1 rounded-full',
                `bg-gradient-to-br ${sticker.color}`
              )}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[9px] font-medium text-gray-700 text-center leading-tight">
                {sticker.message}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ReactionPopover;