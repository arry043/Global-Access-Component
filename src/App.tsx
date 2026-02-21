import MapWidget from './components/MapWidget';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-[var(--background)]">
      {/* The main cinematic map component handles its own layout and scaling */}
      <MapWidget />
    </div>
  );
}

export default App;
