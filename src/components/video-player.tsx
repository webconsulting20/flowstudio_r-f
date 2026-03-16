"use client";

interface VideoPlayerProps {
  url: string;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
      <video
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full"
        src={url}
        playsInline
        preload="metadata"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  );
}
