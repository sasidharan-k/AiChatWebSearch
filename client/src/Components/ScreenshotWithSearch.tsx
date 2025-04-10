import React, { useState } from 'react';
import axios from 'axios';

function ScreenshotPuppeteer() {
  const [query, setQuery] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [Data,setData]=useState('')

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/screenshot', { query }, {
        responseType: 'blob'
      });

      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImage(imageUrl);
    } catch (err) {
      alert('Failed to get screenshot');
    } finally {
      setLoading(false);
    }
  };
  const ImageUpload = async () => {
    if (!image) {
      alert('Please capture a screenshot first.');
      return;
    }

    try {
      const blob = await fetch(image).then(res => res.blob());

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
    <div style={{ padding: 20 }}>

      <input
        type="text"
        value={query}
        placeholder="Search "
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />
      <button onClick={handleSearch} style={{ padding: 10, marginLeft: 10 }}>
        {loading ? 'Loading...' : 'Search & Screenshot'}
      </button>

      {image && (
        <div style={{ marginTop: 20 }}>

          <img src={image} alt="Flipkart Screenshot" style={{ width: '100%', maxWidth: 800 }} />
          <div>   <button type="submit" disabled={loading} onClick={ImageUpload}>Upload</button></div>
          {
            Data && <div>{Data}</div>
          }
        </div>
      )}
    </div>
  );
}

export default ScreenshotPuppeteer;
