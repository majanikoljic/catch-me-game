import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

const difficultySettings = {
  easy: { moveDistance: 100, moveSpeed: 300, triggerDistance: 80 },
  medium: { moveDistance: 150, moveSpeed: 200, triggerDistance: 120 },
  hard: { moveDistance: 200, moveSpeed: 150, triggerDistance: 150 }
};

const achievements = [
  { 
    id: 'first_catch', 
    condition: (stats) => stats.catches === 1, 
    title: 'First Catch!', 
    description: 'You caught the button for the first time!', 
    icon: '🎯' 
  },
  { 
    id: 'five_catches', 
    condition: (stats) => stats.catches === 5, 
    title: 'Getting Good!', 
    description: 'You\'ve caught the button 5 times!', 
    icon: '⭐' 
  },
  { 
    id: 'ten_catches', 
    condition: (stats) => stats.catches === 10, 
    title: 'Button Master!', 
    description: 'You\'ve caught the button 10 times!', 
    icon: '🏆' 
  },
  { 
    id: 'perfect_rate', 
    condition: (stats) => stats.attempts >= 5 && (stats.catches / stats.attempts) === 1, 
    title: 'Perfect Score!', 
    description: '100% success rate with 5+ attempts!', 
    icon: '👑' 
  }
];

export default function Game() {
  const [gameStats, setGameStats] = useState({
    attempts: 0,
    catches: 0
  });
  
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [showInstructions, setShowInstructions] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackEmoji, setFeedbackEmoji] = useState('');
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showMobileHint, setShowMobileHint] = useState(false);
  
  const gameAreaRef = useRef(null);
  const buttonRef = useRef(null);
  const moveTimeoutRef = useRef(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const successRate = gameStats.attempts > 0 ? Math.round((gameStats.catches / gameStats.attempts) * 100) : 0;

  const checkAchievements = useCallback((stats) => {
    achievements.forEach(achievement => {
      if (achievement.condition(stats) && !unlockedAchievements.includes(achievement.id)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        toast({
          title: achievement.title,
          description: achievement.description,
          duration: 4000,
        });
      }
    });
  }, [unlockedAchievements, toast]);

  const showFeedbackAnimation = (emoji, duration = 1500) => {
    setFeedbackEmoji(emoji);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, duration);
  };

  const resetButtonPosition = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const container = gameAreaRef.current.getBoundingClientRect();
    const margin = 60;
    const newX = Math.random() * (container.width - margin * 2) + margin;
    const newY = Math.random() * (container.height - margin * 2) + margin;
    
    setButtonPosition({ x: newX, y: newY });
  }, []);

  const moveButtonAway = useCallback((mouseX, mouseY) => {
    if (!gameAreaRef.current || !buttonRef.current) return;
    
    const containerRect = gameAreaRef.current.getBoundingClientRect();
    const settings = difficultySettings[difficulty];
    
    // Calculate direction away from mouse
    const angle = Math.atan2(mouseY - buttonPosition.y, mouseX - buttonPosition.x);
    const oppositeAngle = angle + Math.PI;
    
    // Add some randomness
    const randomOffset = (Math.random() - 0.5) * 0.5;
    const finalAngle = oppositeAngle + randomOffset;
    
    // Calculate new position
    let newX = buttonPosition.x + Math.cos(finalAngle) * settings.moveDistance;
    let newY = buttonPosition.y + Math.sin(finalAngle) * settings.moveDistance;
    
    // Keep within bounds
    const margin = 60;
    newX = Math.max(margin, Math.min(containerRect.width - margin, newX));
    newY = Math.max(margin, Math.min(containerRect.height - margin, newY));
    
    setButtonPosition({ x: newX, y: newY });
    
    // Clear any existing timeout
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    
    // Add a brief delay before the button can move again
    moveTimeoutRef.current = setTimeout(() => {
      moveTimeoutRef.current = null;
    }, settings.moveSpeed);
  }, [buttonPosition, difficulty]);

  const handleMouseMove = useCallback((e) => {
    if (!isGameActive || !gameAreaRef.current || moveTimeoutRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - buttonPosition.x, 2) + Math.pow(mouseY - buttonPosition.y, 2)
    );
    
    const settings = difficultySettings[difficulty];
    
    if (distance < settings.triggerDistance) {
      moveButtonAway(mouseX, mouseY);
    }
  }, [isGameActive, buttonPosition, difficulty, moveButtonAway]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!isGameActive || !e.touches[0]) return;
    
    const touch = e.touches[0];
    const mockMouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    handleMouseMove(mockMouseEvent);
  }, [isGameActive, handleMouseMove]);

  const handleButtonClick = () => {
    const newStats = {
      attempts: gameStats.attempts + 1,
      catches: gameStats.catches + 1
    };
    
    setGameStats(newStats);
    showFeedbackAnimation('🎉');
    checkAchievements(newStats);
    resetButtonPosition();
  };

  const handleButtonMouseEnter = () => {
    if (!isGameActive) return;
    
    setGameStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
  };

  const startGame = () => {
    setIsGameActive(true);
    setShowInstructions(false);
    resetButtonPosition();
    
    if (isMobile) {
      setShowMobileHint(true);
      setTimeout(() => setShowMobileHint(false), 5000);
    }
  };

  const resetGame = () => {
    setGameStats({ attempts: 0, catches: 0 });
    setButtonPosition({ x: 50, y: 50 });
    setIsGameActive(false);
    setShowInstructions(true);
    setUnlockedAchievements([]);
    setShowFeedback(false);
  };

  const shareScore = async () => {
    const shareText = `I caught the elusive button ${gameStats.catches} times with a ${successRate}% success rate! Can you beat my score?`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Catch Me If You Can - My Score',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showFeedbackAnimation('📋');
        toast({
          title: "Score copied!",
          description: "Share your score with friends!",
        });
      } catch (err) {
        toast({
          title: "Share failed",
          description: "Could not copy score to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    gameArea.addEventListener('mousemove', handleMouseMove);
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      gameArea.removeEventListener('mousemove', handleMouseMove);
      gameArea.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleMouseMove, handleTouchMove]);

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="gradient-bg min-h-screen text-foreground">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center py-8 px-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Catch Me If You Can!
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Try to click the elusive button. It will run away from your cursor! Can you catch it?
          </p>
        </header>

        {/* Stats Panel */}
        <div className="flex justify-center px-4 mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-6 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-accent" data-testid="stat-attempts">
                  {gameStats.attempts}
                </span>
                <span className="text-muted-foreground text-sm">Attempts</span>
              </div>
              <div className="hidden sm:block w-px bg-border"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary" data-testid="stat-catches">
                  {gameStats.catches}
                </span>
                <span className="text-muted-foreground text-sm">Catches</span>
              </div>
              <div className="hidden sm:block w-px bg-border"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-secondary" data-testid="stat-success-rate">
                  {successRate}%
                </span>
                <span className="text-muted-foreground text-sm">Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Arena */}
        <main className="flex-1 flex items-center justify-center px-4 pb-8">
          <div 
            ref={gameAreaRef}
            className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-2xl w-full max-w-4xl h-96 md:h-[500px] overflow-hidden"
            data-testid="game-area"
          >
            {/* Instructions Overlay */}
            {showInstructions && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-2xl z-10">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-2xl font-bold mb-4">How to Play</h2>
                  <ul className="text-left text-muted-foreground space-y-2 mb-6">
                    <li>• Move your cursor toward the blue button</li>
                    <li>• The button will try to escape!</li>
                    <li>• Click it to score a point</li>
                    <li>• Try to improve your success rate</li>
                  </ul>
                  <button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
                    onClick={startGame}
                    data-testid="button-start-game"
                  >
                    Start Playing
                  </button>
                </div>
              </div>
            )}

            {/* Moving Button */}
            <button 
              ref={buttonRef}
              className="moving-button absolute bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-lg glow-effect transform transition-all duration-300 hover:scale-110 animate-pulse-glow"
              style={{
                left: `${buttonPosition.x}px`,
                top: `${buttonPosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleButtonClick}
              onMouseEnter={handleButtonMouseEnter}
              data-testid="button-catch-me"
            >
              Catch Me! 🏃‍♂️
            </button>

            {/* Game Feedback */}
            {showFeedback && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="celebration text-6xl" data-testid="feedback-emoji">
                  {feedbackEmoji}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Control Panel */}
        <footer className="text-center px-4 pb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              onClick={resetGame}
              data-testid="button-reset-game"
            >
              🔄 Reset Game
            </button>
            <button 
              className="bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              onClick={() => setShowInstructions(true)}
              data-testid="button-show-instructions"
            >
              ❓ How to Play
            </button>
            <button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              onClick={shareScore}
              data-testid="button-share-score"
            >
              📤 Share Score
            </button>
          </div>
          
          {/* Difficulty Selector */}
          <div className="mt-6 bg-card/60 backdrop-blur-sm rounded-xl border border-border p-4 inline-block">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Difficulty Level</h3>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === 'easy' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setDifficulty('easy')}
                data-testid="button-difficulty-easy"
              >
                😊 Easy
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === 'medium' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setDifficulty('medium')}
                data-testid="button-difficulty-medium"
              >
                😐 Medium  
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === 'hard' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setDifficulty('hard')}
                data-testid="button-difficulty-hard"
              >
                😈 Hard
              </button>
            </div>
          </div>
        </footer>

        {/* Mobile Instructions */}
        {isMobile && showMobileHint && (
          <div className="fixed bottom-4 left-4 right-4 md:hidden bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-sm text-muted-foreground text-center">
            <span className="font-medium">💡 Tip:</span> On mobile, tap quickly when the button stops moving!
          </div>
        )}
      </div>
    </div>
  );
}
