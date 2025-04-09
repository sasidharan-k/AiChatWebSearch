import React, { useState } from 'react';
import axios from "axios";

function App() {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/screenshot?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        throw new Error('Failed to capture screenshot');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setScreenshot(imageUrl);
    } catch (err) {
      setError('Error capturing screenshot');
    } finally {
      setLoading(false);
    }
  };

  const ImageUpload = async (e) => {
    if (!screenshot) {
      alert('Please select an image to upload.');
      return;
    }

    try {

      const imageData = { image: screenshot };


      const response = await axios.post('http://localhost:5000/upload', imageData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response from image analysis:', response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };


  return (
    <div className="App">

      <form onSubmit={handleSubmit}>
        <div>
          <label>Enter URL:</label>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter a URL to capture"
          />
        </div>
        <button type="submit" disabled={loading}>Capture Screenshot</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {screenshot && (
        <div>

          <img src={screenshot} alt="Screenshot" style={{ width: '100%', maxWidth: '600px' }} />
          <button type="submit" disabled={loading} onClick={ImageUpload}>Upload</button>
        </div>

      )}
    </div>
  );
}

export default App;
