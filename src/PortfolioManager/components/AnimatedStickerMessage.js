import React, { useEffect, useRef, useState } from 'react';
import StickerMessage from './StickerMessage';

// Temporarily import react-rewards differently to handle the CJS module
let useReward;
try {
  const rewards = require('react-rewards');
  useReward = rewards.useReward || rewards.default?.useReward;
} catch (e) {
  console.warn('react-rewards not available, animations disabled');
  // Fallback if react-rewards is not available
  useReward = () => ({ reward: () => {}, isAnimating: false });
}

const AnimatedStickerMessage = ({ message, isAuthor }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const messageRef = useRef(null);

  // Set up different reward animations based on sticker type
  const getRewardConfig = (stickerId) => {
    const configs = {
      trophy: { type: 'confetti', colors: ['#FFD700', '#FFA500', '#FF6347'] },
      star: { type: 'confetti', colors: ['#9333EA', '#EC4899', '#A855F7'] },
      heart: { type: 'emoji', emoji: ['❤️', '💖', '💝', '💕'], elementCount: 20 },
      sparkle: { type: 'confetti', colors: ['#3B82F6', '#8B5CF6', '#6366F1'] },
      target: { type: 'confetti', colors: ['#10B981', '#3B82F6', '#06B6D4'] },
      rocket: { type: 'balloons', elementCount: 15 },
      thumbsup: { type: 'confetti', colors: ['#3B82F6', '#10B981', '#14B8A6'] },
      award: { type: 'confetti', colors: ['#FFD700', '#C0C0C0', '#CD7F32'] },
      crown: { type: 'emoji', emoji: ['👑', '⭐', '✨'], elementCount: 15 },
      medal: { type: 'confetti', colors: ['#F97316', '#EF4444', '#DC2626'] },
      zap: { type: 'confetti', colors: ['#FFFF00', '#FFA500', '#FF4500'] },
      flame: { type: 'emoji', emoji: ['🔥', '💥', '⚡'], elementCount: 20 }
    };
    return configs[stickerId] || configs.star;
  };

  const rewardConfig = getRewardConfig(message.sticker?.id);
  const rewardId = `sticker-${message.id}`;

  // Initialize reward based on config (with fallback if useReward is not available)
  const { reward, isAnimating } = useReward ? useReward(
    rewardId,
    rewardConfig.type,
    rewardConfig.type === 'emoji'
      ? { emoji: rewardConfig.emoji, elementCount: rewardConfig.elementCount }
      : rewardConfig.type === 'balloons'
      ? { elementCount: rewardConfig.elementCount }
      : { colors: rewardConfig.colors }
  ) : { reward: () => {}, isAnimating: false };

  useEffect(() => {
    if (hasAnimated || !messageRef.current) return;

    // Set up Intersection Observer to detect when message enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Small delay to ensure the element is fully rendered
            setTimeout(() => {
              reward();
              setHasAnimated(true);
            }, 100);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
        rootMargin: '0px'
      }
    );

    observer.observe(messageRef.current);

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [hasAnimated, reward]);

  return (
    <div ref={messageRef} className="relative">
      {/* Reward animation anchor point */}
      <span
        id={rewardId}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
      />

      {/* The actual sticker message */}
      <StickerMessage message={message} isAuthor={isAuthor} />
    </div>
  );
};

export default AnimatedStickerMessage;