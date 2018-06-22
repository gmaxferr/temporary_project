const fse = require('fs-extra');
const yargs = require("yargs");

const handler = require('./fileHandler.js')

const argv = yargs
    .options({
        from: {
            describe: "From where to copy directory for patch",
            demand: true,
            alias: 'f',
            string: true
        },
        to: {
            describe: "To where to copy directory",
            demand: true,
            alias: 't',
            string: true
        }
    })
    .help().alias('help', 'h')
    .argv;

var COPY_FROM = argv.from;
var COPY_TO = argv.from;

var valid_From = fs.pathExists(file, (err, exists) => {
    console.log(err) // => null
    console.log(exists) // => false
})

var valid_To = fs.pathExists(file, (err, exists) => {
    console.log(err) // => null
    console.log(exists) // => false
})


if (valid_From && valid_To) {

    fse.copy(COPY_FROM, COPY_TO, {overwrite: false})
        .then(() => {
            console.log('Folder copied!')

            handler.handle(COPY_FROM, COPY_TO).then(() => {
                console.log('Files handled')
            })


        })
        .catch(err => {
            console.error(err)
        });

} else {
    console.log("Invalid information given in Params. Paths not found!")
}