// Home page component
// This is the main landing page of the TxT Sanitizer application

function Home() {
  return (
    <div className="">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TxT Sanitizer
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Clean and sanitize your text content with ease
        </p>
        <div className="space-x-4">
          {/* Add navigation buttons here in the future */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;