// server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Initialize dataset in memory
let todoList = [];

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === 'GET' && url === '/') {
        // Serve index.html
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (method === 'POST' && url === '/submit') {
        // Handle form submissions
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { firstname, task, priority } = querystring.parse(body);
            
            // Find user in todoList or create new entry for the user
            let userTasks = todoList.find(user => user.firstname === firstname);
            if (!userTasks) {
                userTasks = { firstname, tasks: [] };
                todoList.push(userTasks);
            }

            // Generate unique ID for the task
            const taskId = userTasks.tasks.length > 0 ? userTasks.tasks[userTasks.tasks.length - 1].id + 1 : 1;

            // Add new task to the user's tasks
            const newTask = { id: taskId, task, priority, createdAt: new Date(), status: "Pending" };
            userTasks.tasks.push(newTask);

            // Send updated data as response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(todoList));
        });
    } else if (method === 'GET' && url === '/results') {
        // Serve results.html
        fs.readFile(path.join(__dirname, 'public', 'results.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (method === 'GET' && url === '/get-todos') {
        // Provide todo list data to the results page
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(todoList));
    } else {
        // Handle 404 - Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

