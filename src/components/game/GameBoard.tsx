import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GameCard } from '@/types';
import { fetchTTS } from '@/utils/tts';

interface GameBoardProps {
  cards: GameCard[];
  onCardClick: (cardId: string) => void;
  isCompleted: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ cards, onCardClick, isCompleted }) => {
  return (
    <Card className="max-w-[420px] mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-1.5 mb-6 max-w-[360px] mx-auto">
          {cards.map((card) => (
            <GameCardComponent
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
              disabled={isCompleted}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface GameCardComponentProps {
  card: GameCard;
  onClick: () => void;
  disabled: boolean;
}

const GameCardComponent: React.FC<GameCardComponentProps> = ({ card, onClick, disabled }) => {
  const isClickable = !card.isMatched && !card.isFlipped && !disabled;

  // 🎵 改成直接调用后端生成并播放 Supabase 上的音频
  const handleClick = () => {
    if (!isClickable) return;

    onClick();

    if (card.lang && card.content) {
      fetchTTS(card.content, card.lang).catch(err => {
        console.error('TTS 播放失败:', err);
      });
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-square cursor-pointer transition-all duration-150 transform",
        isClickable && "hover:scale-105",
        !isClickable && "cursor-not-allowed"
      )}
      onClick={handleClick}
    >
      {/* 卡片背面 */}
      <div
        className={cn(
          "absolute inset-0 rounded-md border transition-all duration-200 transform-gpu",
          "bg-slate-50 border-slate-200",
          "flex items-center justify-center",
          card.isFlipped || card.isMatched ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"
        )}
      ></div>

      {/* 卡片正面 */}
      <div
        className={cn(
          "absolute inset-0 rounded-md border transition-all duration-200 transform-gpu",
          "flex items-center justify-center p-1.5 text-center",
          card.isFlipped || card.isMatched ? "rotate-y-0 opacity-100" : "rotate-y-180 opacity-0",
          card.type === 'english'
            ? "bg-blue-50  border-blue-200"
            : "bg-slate-50 border-slate-200",
          card.isMatched && "ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200"
        )}
      >
        <span className={cn(
          "leading-tight break-words text-xs",
          card.type === 'english' ? "font-medium text-blue-700" : "text-slate-700"
        )}>
          {card.content}
        </span>
      </div>

      {/* 匹配成功动画 */}
      {card.isMatched && (
        <div className="absolute inset-0 rounded-md bg-yellow-400 opacity-20 animate-pulse" />
      )}
    </div>
  );
};

export default GameBoard;


