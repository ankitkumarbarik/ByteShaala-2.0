import { useState } from "react";

const VideoPlayer = ({ videoUrl, lectureTitle }) => {
  const [showTitle, setShowTitle] = useState(true);

  // Detect video type
  const getVideoType = (url) => {
    if (!url) return "none";
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    return "direct";
  };

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract Vimeo video ID
  const getVimeoId = (url) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const videoType = getVideoType(videoUrl);
  const youtubeId = videoType === "youtube" ? getYouTubeId(videoUrl) : null;
  const vimeoId = videoType === "vimeo" ? getVimeoId(videoUrl) : null;

  return (
    <div className="relative bg-black w-full">
      {/* Lecture Title Overlay */}
      {showTitle && lectureTitle && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
          <h3 className="text-white text-lg font-semibold">{lectureTitle}</h3>
          <button
            onClick={() => setShowTitle(false)}
            className="absolute top-2 right-2 text-white/60 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Video Player */}
      {videoType === "youtube" && youtubeId ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
            title={lectureTitle || "Video Player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : videoType === "vimeo" && vimeoId ? (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0`}
            title={lectureTitle || "Video Player"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : videoType === "direct" ? (
        <video
          className="w-full aspect-video"
          src={videoUrl}
          controls
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">No video available</p>
            <p className="text-sm">Please check the video URL</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
