import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useReward } from 'react-rewards';
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

const QuickStickers = ({ onSelectSticker, className }) => {
  const [selectedSticker, setSelectedSticker] = useState(null);

  // React-rewards hooks for different stickers
  const { reward: rewardTrophy, isAnimating: animatingTrophy } = useReward('trophy-sticker', 'confetti');
  const { reward: rewardStar, isAnimating: animatingStar } = useReward('star-sticker', 'confetti');
  const { reward: rewardHeart, isAnimating: animatingHeart } = useReward('heart-sticker', 'emoji', {
    emoji: ['❤️', '💖', '💝', '💕'],
    elementCount: 20
  });
  const { reward: rewardSparkle, isAnimating: animatingSparkle } = useReward('sparkle-sticker', 'confetti', {
    colors: ['#FFD700', '#FFA500', '#FF69B4']
  });
  const { reward: rewardTarget, isAnimating: animatingTarget } = useReward('target-sticker', 'confetti');
  const { reward: rewardRocket, isAnimating: animatingRocket } = useReward('rocket-sticker', 'balloons');
  const { reward: rewardThumbsUp, isAnimating: animatingThumbsUp } = useReward('thumbsup-sticker', 'confetti');
  const { reward: rewardAward, isAnimating: animatingAward } = useReward('award-sticker', 'confetti', {
    colors: ['#FFD700', '#C0C0C0', '#CD7F32']
  });
  const { reward: rewardCrown, isAnimating: animatingCrown } = useReward('crown-sticker', 'emoji', {
    emoji: ['👑', '⭐', '✨'],
    elementCount: 15
  });
  const { reward: rewardMedal, isAnimating: animatingMedal } = useReward('medal-sticker', 'confetti');
  const { reward: rewardZap, isAnimating: animatingZap } = useReward('zap-sticker', 'confetti', {
    colors: ['#FFFF00', '#FFA500', '#FF4500']
  });
  const { reward: rewardFlame, isAnimating: animatingFlame } = useReward('flame-sticker', 'emoji', {
    emoji: ['🔥', '💥', '⚡'],
    elementCount: 20
  });

  const stickers = [
    {
      id: 'trophy',
      icon: Trophy,
      message: 'Great Work!',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      iconColor: 'text-yellow-600',
      reward: rewardTrophy,
      isAnimating: animatingTrophy
    },
    {
      id: 'star',
      icon: Star,
      message: 'Excellent!',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      reward: rewardStar,
      isAnimating: animatingStar
    },
    {
      id: 'heart',
      icon: Heart,
      message: 'Love This!',
      color: 'from-pink-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-red-50',
      iconColor: 'text-pink-600',
      reward: rewardHeart,
      isAnimating: animatingHeart
    },
    {
      id: 'sparkle',
      icon: Sparkles,
      message: 'Amazing!',
      color: 'from-blue-400 to-purple-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-purple-50',
      iconColor: 'text-blue-600',
      reward: rewardSparkle,
      isAnimating: animatingSparkle
    },
    {
      id: 'target',
      icon: Target,
      message: 'On Target!',
      color: 'from-green-400 to-blue-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-blue-50',
      iconColor: 'text-green-600',
      reward: rewardTarget,
      isAnimating: animatingTarget
    },
    {
      id: 'rocket',
      icon: Rocket,
      message: 'Blast Off!',
      color: 'from-indigo-400 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      iconColor: 'text-indigo-600',
      reward: rewardRocket,
      isAnimating: animatingRocket
    },
    {
      id: 'thumbsup',
      icon: ThumbsUp,
      message: 'Well Done!',
      color: 'from-blue-400 to-green-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-green-50',
      iconColor: 'text-blue-600',
      reward: rewardThumbsUp,
      isAnimating: animatingThumbsUp
    },
    {
      id: 'award',
      icon: Award,
      message: 'Outstanding!',
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      iconColor: 'text-amber-600',
      reward: rewardAward,
      isAnimating: animatingAward
    },
    {
      id: 'crown',
      icon: Crown,
      message: 'Champion!',
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      iconColor: 'text-yellow-600',
      reward: rewardCrown,
      isAnimating: animatingCrown
    },
    {
      id: 'medal',
      icon: Medal,
      message: 'Winner!',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      reward: rewardMedal,
      isAnimating: animatingMedal
    },
    {
      id: 'zap',
      icon: Zap,
      message: 'Superb!',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      iconColor: 'text-yellow-600',
      reward: rewardZap,
      isAnimating: animatingZap
    },
    {
      id: 'flame',
      icon: Flame,
      message: 'On Fire!',
      color: 'from-orange-400 to-red-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      reward: rewardFlame,
      isAnimating: animatingFlame
    }
  ];

  const handleStickerClick = (sticker) => {
    setSelectedSticker(sticker.id);

    // Trigger confetti/animation
    sticker.reward();

    // Send the sticker after a short delay for animation
    setTimeout(() => {
      onSelectSticker({
        id: sticker.id,
        icon: sticker.icon.name,
        message: sticker.message,
        color: sticker.color
      });
      setSelectedSticker(null);
    }, 500);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Quick Reactions</h4>
        <span className="text-xs text-gray-500">Click to send encouragement!</span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {stickers.map((sticker) => {
          const Icon = sticker.icon;
          return (
            <div key={sticker.id} className="relative">
              <span id={`${sticker.id}-sticker`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <Button
                variant="ghost"
                onClick={() => handleStickerClick(sticker)}
                disabled={sticker.isAnimating || selectedSticker === sticker.id}
                className={cn(
                  'relative h-auto p-3 flex flex-col items-center gap-1 transition-all duration-300',
                  'hover:scale-110 hover:shadow-lg',
                  sticker.bgColor,
                  'border-2 border-transparent hover:border-gray-200',
                  selectedSticker === sticker.id && 'scale-125 animate-bounce'
                )}
              >
                <div className={cn(
                  'p-2 rounded-full',
                  `bg-gradient-to-br ${sticker.color}`
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  {sticker.message}
                </span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickStickers;