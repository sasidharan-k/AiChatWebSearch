import React, { useState, useEffect } from 'react';

export default function Home() {
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGumloopData = async () => {
      const url = 'https://api.gumloop.com/api/v1/start_pipeline';
      const apiKey = 'bb7d5103f2df4e2ba8bb9fd8892ebf1a';
      const userId = 'KIzsHxTjFhcpdkKXxWhsVna3N7R2';
      const savedItemId = 'i7yoWZVTkLzQPFbD8M98QY';
      const requestData = {
        user_id: userId,
        saved_item_id: savedItemId,
        pipeline_inputs: [{ input_name: 'input', value: 'https://tailwindcss.com' }],
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setResponseData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGumloopData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div>

        <pre>{JSON.stringify(responseData, null, 2)}</pre>
      </div>
    </div>
  );
}
