const express = require('express')
const fs = require("fs")
const multer = require('multer')
const { TesseractWorker } = require('tesseract.js')

const app = express()
const worker = new TesseractWorker();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage }).single("avatar")

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/uploads', (req, res) => {
    upload(req, res, err => {
        console.log(req.file);
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log(err)

            worker
                .recognize(data, "eng", {tessjs_create_pdf: "1"})
                .progress(progress => {
                    console.log(progress)
                })
                .then(result => {
                    res.redirect('/download')
                })
                .catch(err => {
                    res.json({"error": "TRUE"})
                })
                .finally(() => worker.terminate())
        })
    })
})

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`
    res.download(file)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server Started on ${PORT}`))