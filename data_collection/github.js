import fetch from 'node-fetch';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Function to get the course content from the github repo
// Description: Essentially just a recursive call through directories to get the content of each module in each course
// Input: limit - the amount of courses to get
// Output: A list of courses
// TODO: Add offset to start from a certain course. There's probably a better way to do this but gotta go fast
export async function get_course(limit) {
    let headers = {
        'Authorization': `token ${GITHUB_TOKEN}`
    }
    let response = await fetch('https://api.github.com/repos/Cyfrin/Updraft/contents/courses', {
        headers: headers
        });
    let data = await response.json();
    let courses = {};
    for (let i = 0; i < limit; i++) {
        let this_course = {};
        let course = data[i];
        let module = course.name;
        let module_response = await fetch(`https://api.github.com/repos/Cyfrin/Updraft/contents/courses/${module}`, {
            headers: headers
        });
        let module_data = await module_response.json();
        for (let j = 0; j < module_data.length; j++) {
            let new_link = module_data[j].url;
            let course_response = await fetch(new_link, {
                headers: headers
            });
            let this_module_data = await course_response.json();
            let third_link = this_module_data[0].url;
            let third_response = await fetch(third_link, {
                headers: headers
            });
            let third_data = (await third_response.json())[0];
            let content = await fetch(third_data.download_url, {
                headers: headers
            });
            content = await content.text();
            this_course[third_data.path] = content;
        }
        courses[module] = this_course;
    }
    return courses;
}
