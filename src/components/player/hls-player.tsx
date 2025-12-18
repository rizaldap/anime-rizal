"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    Download,
    Cloud,
    Moon,
    Video,
    Film,
    ExternalLink
} from "lucide-react";
import type { Stream } from "@/types/anime";

interface HlsPlayerProps {
    streams: Stream[];
    onEnded?: () => void;
}

const providerIcons: Record<string, React.ReactNode> = {
    cloud: <Cloud className="w-4 h-4" />,
    moon: <Moon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    film: <Film className="w-4 h-4" />,
};

export function HlsPlayer({ streams, onEnded }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);

    const currentStream = streams[selectedIndex];

    useEffect(() => {
        if (!currentStream || !videoRef.current) return;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        setShowEmbed(false);

        // HLS stream
        if (currentStream.type === "hls" && currentStream.url.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(currentStream.url);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    videoRef.current?.play().catch(() => { });
                });
                hlsRef.current = hls;
            } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                videoRef.current.src = currentStream.url;
                videoRef.current.play().catch(() => { });
            }
        } else if (currentStream.type === "embed") {
            setShowEmbed(true);
        } else {
            videoRef.current.src = currentStream.url;
            videoRef.current.play().catch(() => { });
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentStream]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    const downloadStream = () => {
        if (currentStream?.url) {
            window.open(currentStream.url, "_blank");
        }
    };

    if (streams.length === 0) {
        return (
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
                <div className="text-center">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Tidak ada streaming tersedia</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Video Container */}
            <div
                ref={containerRef}
                className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-gray-400/20 shadow-2xl shadow-gray-400/10"
            >
                {showEmbed ? (
                    <iframe
                        src={currentStream.url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media; fullscreen"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={onEnded}
                    />
                )}
            </div>

            {/* Server Selection */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Pilih Server
                    </h3>
                    {currentStream.type === "hls" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadStream}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {streams.map((stream, index) => (
                        <Button
                            key={index}
                            variant={selectedIndex === index ? "default" : "outline"}
                            onClick={() => setSelectedIndex(index)}
                            className="flex-col h-auto py-3 gap-1"
                        >
                            <div className="flex items-center gap-2">
                                {providerIcons[stream.icon || "video"]}
                                <span className="text-sm font-medium">{stream.provider}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {stream.quality}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
