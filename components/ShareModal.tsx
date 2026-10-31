'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { GameScoreResult, PlayerProfile } from '@/lib/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GameScoreResult;
  profile: PlayerProfile;
}

export default function ShareModal({ isOpen, onClose, result, profile }: ShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-resolution scorecard card (800 x 1000)
    canvas.width = 800;
    canvas.height = 1000;

    // Background Gradient (Dark Cyber Neon)
    const bg = ctx.createLinearGradient(0, 0, 800, 1000);
    bg.addColorStop(0, '#090d16');
    bg.addColorStop(0.5, '#1e1b4b');
    bg.addColorStop(1, '#110c22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 1000);

    // Glowing Neon Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 960);

    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, 748, 948);

    // Brand Title
    ctx.textAlign = 'center';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.fillText('FLYING BALAYYA BABU', 400, 100);

    ctx.font = '700 18px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText('“JAI BALAYYA! ONE TAP. INFINITE CHAOS.”', 400, 135);

    // Character Avatar
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = profile.avatarUrl || '/assets/default-character.png';
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(400, 260, 75, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 325, 185, 150, 150);
      ctx.restore();

      // Avatar Border
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(400, 260, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Username
      ctx.font = '800 32px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(profile.username, 400, 390);

      // Score Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(150, 430, 500, 200);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(150, 430, 500, 200);

      ctx.font = '700 20px system-ui, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('FINAL SCORE', 400, 475);

      ctx.font = '900 90px system-ui, sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 25;
      ctx.fillText(result.score.toString(), 400, 580);
      ctx.shadowBlur = 0;

      // Personal Best Banner
      if (result.isNewBest) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(260, 650, 280, 40);
        ctx.font = '800 18px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🔥 NEW PERSONAL BEST! 🔥', 400, 676);
      } else {
        ctx.font = '700 20px system-ui, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(`PERSONAL BEST: ${result.personalBest}`, 400, 675);
      }

      // Rankings Grid
      ctx.font = '700 22px system-ui, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`GLOBAL RANK: #${result.globalRank || 1}`, 400, 735);

      ctx.font = '600 18px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`DAILY RANK: #${result.dailyRank || 1}   •   WEEKLY RANK: #${result.weeklyRank || 1}`, 400, 775);

      // Death Quote
      ctx.font = 'italic 600 22px system-ui, sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`“${result.deathMessage}”`, 400, 840);

      // Footer
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('PLAY FREE AT: FLYING BALAYYA BABU ARCADE', 400, 930);

      try {
        setPreviewUrl(canvas.toDataURL('image/png'));
      } catch {
        // ignore
      }
    };
  }, [isOpen, result, profile]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `flying-balayya-score-${result.score}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(`I just scored ${result.score} in FLYING BALAYYA BABU! Can you beat my score? Play at: ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (navigator.share && canvas) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'flying-balayya-score.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'FLYING BALAYYA BABU Scorecard',
              text: `I just scored ${result.score} on FLYING BALAYYA BABU! Jai Balayya! 🔥`,
              files: [file],
            });
          } else {
            await navigator.share({
              title: 'FLYING BALAYYA BABU Scorecard',
              text: `I just scored ${result.score} on FLYING BALAYYA BABU! Check it out!`,
              url: window.location.origin,
            });
          }
        });
      } catch {
        // Share cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(
    `🔥 I just scored ${result.score} in FLYING BALAYYA BABU! Jai Balayya! Beat my record: ${typeof window !== 'undefined' ? window.location.origin : ''}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-zinc-950 p-6 shadow-2xl shadow-rose-950/40">
        <button
          onClick={onClose}
          aria-label="Close share dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-center text-xl font-black text-amber-400">SHARE SCORECARD</h3>
        <p className="mt-1 text-center text-xs text-zinc-400">Flex your high score to friends and social media!</p>

        {/* Hidden Canvas for High-Res Generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview image */}
        {previewUrl && (
          <div className="mt-4 flex justify-center">
            <img
              src={previewUrl}
              alt="Scorecard Preview"
              className="max-h-72 rounded-2xl border border-amber-500/30 shadow-lg"
            />
          </div>
        )}

        {/* Share buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={handleDownload}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900 p-3 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
          >
            <Download className="h-5 w-5 text-amber-400" />
            Download
          </button>

          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/40 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-emerald-400" />
            WhatsApp
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-sky-500/20 bg-sky-950/30 p-3 text-xs font-bold text-sky-300 transition hover:bg-sky-900/40 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-sky-400" />
            Twitter / X
          </a>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-purple-500/20 bg-purple-950/30 p-3 text-xs font-bold text-purple-300 transition hover:bg-purple-900/40 active:scale-95"
          >
            <Share2 className="h-5 w-5 text-purple-400" />
            Share
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Link Copied to Clipboard!' : 'Copy Share Text & Link'}
        </button>
      </div>
    </div>
  );
}
