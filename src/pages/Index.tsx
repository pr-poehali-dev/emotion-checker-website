import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

const emotions: { name: Emotion; emoji: string; label: string }[] = [
  { name: 'happy', emoji: '😊', label: 'Счастье' },
  { name: 'sad', emoji: '😢', label: 'Грусть' },
  { name: 'angry', emoji: '😠', label: 'Злость' },
  { name: 'surprised', emoji: '😮', label: 'Удивление' },
  { name: 'neutral', emoji: '😐', label: 'Нейтральность' },
];

type Screen = 'welcome' | 'camera' | 'result';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [targetEmotion, setTargetEmotion] = useState<Emotion>('happy');
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion>('neutral');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startTest = async () => {
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setTargetEmotion(randomEmotion.name);
    setScreen('camera');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access denied', error);
    }
  };

  useEffect(() => {
    if (screen === 'camera' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (screen === 'camera' && countdown === 0) {
      const randomResult = emotions[Math.floor(Math.random() * emotions.length)];
      setDetectedEmotion(randomResult.name);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setTimeout(() => setScreen('result'), 500);
    }
  }, [screen, countdown, stream]);

  const resetTest = () => {
    setScreen('welcome');
    setCountdown(5);
    setDetectedEmotion('neutral');
  };

  const targetEmotionData = emotions.find(e => e.name === targetEmotion);
  const detectedEmotionData = emotions.find(e => e.name === detectedEmotion);
  const isMatch = targetEmotion === detectedEmotion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {screen === 'welcome' && (
          <Card className="p-12 text-center animate-fade-in shadow-xl border-0">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Icon name="Smile" size={48} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Детектор эмоций
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Проверьте, как хорошо вы можете изобразить заданную эмоцию перед камерой
              </p>
            </div>
            
            <Button 
              size="lg" 
              onClick={startTest}
              className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Icon name="Camera" size={24} className="mr-3" />
              Пройти проверку
            </Button>
          </Card>
        )}

        {screen === 'camera' && (
          <Card className="p-8 animate-scale-in shadow-xl border-0 overflow-hidden">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-4">Изобразите эмоцию</h2>
              <div className="inline-flex items-center gap-4 bg-blue-50 px-8 py-4 rounded-2xl">
                <span className="text-6xl">{targetEmotionData?.emoji}</span>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Покажите</p>
                  <p className="text-2xl font-bold text-blue-600">{targetEmotionData?.label}</p>
                </div>
              </div>
            </div>

            <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-video">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="text-white text-8xl font-bold animate-pulse-glow">
                    {countdown}
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-muted-foreground">
              {countdown > 0 ? `Подготовьтесь... ${countdown}` : 'Анализируем...'}
            </p>
          </Card>
        )}

        {screen === 'result' && (
          <Card className="p-12 animate-fade-in shadow-xl border-0">
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isMatch 
                  ? 'bg-gradient-to-br from-green-400 to-green-600' 
                  : 'bg-gradient-to-br from-orange-400 to-orange-600'
              } shadow-lg`}>
                <Icon 
                  name={isMatch ? 'Check' : 'X'} 
                  size={64} 
                  className="text-white"
                />
              </div>

              <h2 className="text-3xl font-bold mb-8">
                {isMatch ? 'Отлично!' : 'Почти получилось!'}
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-8 max-w-md mx-auto">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">Нужно было</p>
                  <div className="text-5xl mb-2">{targetEmotionData?.emoji}</div>
                  <p className="font-semibold text-lg">{targetEmotionData?.label}</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">Вы показали</p>
                  <div className="text-5xl mb-2">{detectedEmotionData?.emoji}</div>
                  <p className="font-semibold text-lg">{detectedEmotionData?.label}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={startTest}
                  className="rounded-xl"
                >
                  <Icon name="RotateCcw" size={20} className="mr-2" />
                  Попробовать снова
                </Button>
                
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={resetTest}
                  className="rounded-xl"
                >
                  На главную
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
