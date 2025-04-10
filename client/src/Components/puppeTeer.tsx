import React, { useState } from 'react';
import axios from "axios";

function App() {
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data,setData] = useState('')

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
  const ImageUpload = async () => {
    if (!screenshot) {
      alert('Please capture a screenshot first.');
      return;
    }

    try {
      const blob = await fetch(screenshot).then(res => res.blob());

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Extract base64 data from the result
        const base64ImageUrl = `data:image/jpeg;base64,${base64data}`;

        try {
          // Make the request to your backend server's upload-image endpoint
          const response = await axios.post('http://localhost:5000/upload-image', {
            image: base64ImageUrl, // Send base64 image string to the server
          });

          // Handle the response from your backend (which will return OpenAI's analysis)
          console.log('OpenAI Response:', response.data);
          setData(response.data); // Assuming you're using `setData` to display the result

        } catch (apiError) {
          console.error('Error calling backend upload-image:', apiError);
        }
      };

      reader.readAsDataURL(blob); // Convert blob to base64

    } catch (error) {
      console.error('Error processing image:', error);
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
          <div>   <button type="submit" disabled={loading} onClick={ImageUpload}>Upload</button></div>

          {
          data && ( <div>{data}</div>)
        }
        </div>


      )}
    </div>
  );
}

export default App;
