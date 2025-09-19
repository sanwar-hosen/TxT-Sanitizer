// About page component
// This page provides information about the TxT Sanitizer application

function About() {
  return (
    <div className="">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          About TxT Sanitizer
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 leading-relaxed mb-4">
            TxT Sanitizer is a powerful text cleaning and sanitization tool 
            built with React and modern web technologies.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Created by Sano, this application helps users clean, format, 
            and sanitize various types of text content efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;