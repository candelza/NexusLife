import YoutubeVideo from '../components/YoutubeVideo';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Embedded YouTube Video</h1>
        <YoutubeVideo />
      </div>
    </div>
  );
};

export default Index;
