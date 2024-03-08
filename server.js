const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Using promises for cleaner async/await

const app = express();
const port = 3000;

// Set views directory and template engine
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

async function getFiles() {
    const files = await fs.readdir('data')
    return files;
}

// list files
app.get('/', async (req, res) => {
    try {
        const files = await getFiles();
        res.render('index', { files });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/create', async (req, res) => {
    try {
        res.render('create');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        console.log(err)
    }
});
// Route for creating a new file
app.post('/create', async (req, res) => {
    const { filename, content } = req.body;

    try {
        await fs.writeFile(`data/${filename}.txt`, content);
        res.redirect('/'); // Redirect to homepage after successful creation
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating file');
    }
});



// Route for viewing file content
app.get('/files/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const content = await fs.readFile(`data/${filename}`, 'utf-8');
        res.render('detail', { filename, content });
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send('File not found');
        } else {
            console.error(err);
            res.status(500).send('Error reading file');
        }
    }
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
