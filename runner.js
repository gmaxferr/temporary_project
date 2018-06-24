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
        },
        p: {
            descrive: "Force Override at inicial copy",
            demand: false,
        }
    })
    .help().alias('help', 'h')
    .argv;

var COPY_FROM = argv.from;
var COPY_TO = argv.to;

var valid_From = false;
valid_From = fse.pathExistsSync(COPY_FROM);

var valid_To = false;
valid_To = fse.pathExistsSync(COPY_TO)

var force_override = false;
if(argv.p){
    console.log("Force Override!")
    force_override = true;
}

if (valid_From && valid_To) {
    console.log(`From: '${COPY_FROM}'`)
    console.log(`To:   '${COPY_TO}'`)


    fse.copy(COPY_FROM, COPY_TO, {
            overwrite: force_override
        })
        .then(() => {
            console.log('Folder copied!')

            handler.handle().then((results) => {
                console.log('Files handled')

                var deps = results.cross_patch_deps;
                for(i in deps){
                    fse.copySync(`${results.deps_folder}\\${deps[i].name}` // From
                        , deps[i].path // To
                        , {
                            overwrite: true
                        } // Override existing files
                        , (error) => { // Error catch function
                            console.log(error)
                        });
                }

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