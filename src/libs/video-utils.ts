interface VideoData {
  url?: string;
  bunnyVideoId?: string;
  isYoutube?: boolean;
  youtubeUrl?: string;
}

export const getVideoEmbedUrl = (video: VideoData) => {
  if (video.bunnyVideoId) {
    return `https://iframe.mediadelivery.net/embed/330257/${video.bunnyVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
  }

  if (video.isYoutube && video.youtubeUrl) {
    const youtubeRegex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const youtubeMatch = video.youtubeUrl.match(youtubeRegex);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return "";
};

export const isYouTubeUrl = (url: string) => {
  const youtubeRegex = /(?:youtube\.com|youtu\.be)/;
  return youtubeRegex.test(url);
};
