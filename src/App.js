import './App.css';

function App() {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Study Group App
        </h1>
        <p className="text-gray-600 mb-6">
          Frontend setup complete! 🚀
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
          Start Building
        </button>
      </div>
    </div>
  );
}

export default App;
