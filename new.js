async function addCourses() {
    const endpoint = 'http://localhost:3000/add/5';
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        // If the HTTP status code is not 200-299, throw an error.
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json(); // Assuming the server responds with JSON.
      console.log('Courses added:', data);
    } catch (error) {
      console.error('Error adding courses:', error);
    }
  }
  
  addCourses();
  