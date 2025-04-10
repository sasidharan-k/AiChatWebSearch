import { useEffect } from "react"
function Test(){
  useEffect(() => {
    fetch('http://localhost:5000/hello')
      .then(res => res.text())
      .then(data => console.log('Received from server:', data))
      .catch(err => console.error('Error:', err));
  }, []);


}
export default Test;