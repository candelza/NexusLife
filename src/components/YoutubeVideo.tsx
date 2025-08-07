const YoutubeVideo = () => {
  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        className="w-full h-full"
        src="https://www.youtube.com/embed/uceoNeCTfsk"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YoutubeVideo;
