


import OpenAI from "openai";
import React from "react";
import { useEffect } from "react";
function App() {


  const fetchAIResponse = async () => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "how are you?" }],
        }),
      });

      const data = await res.json();
      console.log(data.choices?.[0]?.message?.content || "No response")

    } catch (error) {
      console.error("Error:", error);

    }
  };
 useEffect(()=>{
  fetchAIResponse();
 })

  return (
    <div className="App">

    </div>
  );
}

export default App;