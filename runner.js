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
var COPY_TO = argv.to;

console.log(COPY_FROM)
console.log(COPY_TO)

var valid_From = false;
valid_From= fse.pathExistsSync(COPY_FROM);

var valid_To = false;
valid_To = fse.pathExistsSync(COPY_TO)
console.log(valid_To);
console.log(valid_From);

if (valid_From && valid_To) {

    fse.copy(COPY_FROM, COPY_TO, { overwrite: false })
        .then(() => {
            console.log('Folder copied!')

            handler.handle().then((results) => {
                console.log('Files handled')

                results.cross_patch_deps.forEach(dep => {
                    fse.copySync(`${deps_folder}\\${dep.name}` // From
                        , dep.path // To
                        , { overwrite: false } // Override existing files
                        , (error) => { // Error catch function
                            console.log(error)
                        });
                });

            }).catch(err => {
                console.error(err)
            });

        })
        .catch(err => {
            console.error(err)
        });

} else {
    console.log("Invalid information given in Params. Paths not found!")
}