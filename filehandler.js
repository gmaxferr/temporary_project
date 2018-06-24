const fse = require('fs-extra')
const walk = require('walk');

var DEPS_FILE;
var PATCH_FOUND_FILE_JSON;
var CROSS_INFO_JSON;
var PATCH_ACC;
// const FILTERING_EXTENSIONS = ['ocx', 'dll', 'exe'];
var FILTERING_EXTENSIONS;

var DEPS_FOLDER;

var PATCH_FILES = []; // files to substitute in patch folder
var DEPS_FOUND = []; // deps we have in workspace
const CONFIG_FILE_PATH = './config.json';

var fetchConfigs = () => {

    return new Promise((resolve, reject) => {
        var result = JSON.parse(fse.readFileSync(CONFIG_FILE_PATH));

        DEPS_FILE = result.depsLogFile;
        PATCH_FOUND_FILE_JSON = result.patchLogFile;
        CROSS_INFO_JSON = result.crossLogFile;
        PATCH_ACC = result.folderPatch;
        FILTERING_EXTENSIONS = result.extensions;
        DEPS_FOLDER = result.folderDeps;
        PATCH_EXEC_PATH = result.patch_executable_path;

        var valid = fse.pathExistsSync(DEPS_FILE) &&
            fse.pathExistsSync(PATCH_ACC) &&
            fse.pathExistsSync(PATCH_EXEC_PATH) &&
            fse.pathExistsSync(DEPS_FOLDER);

        if (valid) {
            resolve('Done Loading configurations!');
        } else {
            reject('ERROR: Config.json file has non existing paths as configuration!');
        }

    });
}


// Lê as dependencias antigas já existentes em ficheiro e armazena em 'DEPS_FOUND'.
var readDepsFile = () => {
    try {
        return recheckDeps();
    } catch (err) {
        console.log(err);
    }

};

// Encontra os DLLs na pasta de compilações, que pertencem a SageACC
// Pesquisa utilizando filtros - myData.
var recheckDeps = () => {
    var files = [];

    fse.readdirSync(DEPS_FOLDER).forEach(file => {
        if (checkFileFoundName(file)) { // filter extensions
            files.push({
                name: file.toLowerCase()
            });
        }
    })

    fse.writeFileSync(DEPS_FILE, JSON.stringify(files));
    return files;
}

// Encontra os DLLs na pasta da Patch e guarda tanto o seu caminho como
// guarda o nome - patchData.
var findFromOldPatch = () => {

    return new Promise((resolve, reject) => {
        var files = [];
        var cross;
        // Walker options
        var walker = walk.walk(PATCH_ACC, {
            followLinks: false
        });

        walker.on('file', function (root, stat, next) {
            // Add this file to the list of files
            if (checkFileFoundName(stat.name)) { // filter extensions
                files.push({
                    name: stat.name.toLowerCase(),
                    path: `${root}\\${stat.name.toLowerCase()}`
                });
            }
            next();
        }).on('end', function () {
            cross = files;
            fse.writeFileSync(PATCH_FOUND_FILE_JSON, JSON.stringify(files)); //for reading info purposes
            cross = applyFilters(cross); // retorna uma lista de cruzamento estre as dependencias para o Patch e as dependencias que temos
            fse.writeFileSync(CROSS_INFO_JSON, JSON.stringify(cross)); //for reading info purposes
            if (files.length === 0 || cross.length === 0) {
                reject('Nothing found on Old patch')
            } else {

                resolve({
                    _files: files,
                    _cross: cross
                });
            }

        });


    });

}

var checkFileFoundName = (name) => {
    var extension = name.split('.')[1]; //get extension
    return FILTERING_EXTENSIONS.includes(extension); //check extensions
}

//aplica filtros, fazendo cruzando com as deps existentes
var applyFilters = (files) => {
    var cross = [];
    var valid = false;

    for (i in files) {
        for (d in DEPS_FOUND) {
            valid = files[i].name === DEPS_FOUND[d].name;
            if (valid) cross.push(files[i]); // Se faz match a um nome é imediatamente válido e é armazenado
        }
    }
    return cross;
}


var handle = () => {
    // ler lista de dependencias da SageAcc
    return new Promise((resolve, reject) => {
        if (!fse.pathExistsSync(CONFIG_FILE_PATH)) {
            reject('Config.json file not found!');
        }

        fetchConfigs().then((msg) => {
            console.log(msg)
        }).catch((err) => {
            reject(err);
        });

        DEPS_FOUND = readDepsFile();
        var aux;

        findFromOldPatch().then((result) => {;
            aux = result;

            PATCH_FILES = aux._files;
    
            if (DEPS_FOUND.length === 0 || PATCH_FILES.length === 0 || aux._cross.length === 0) {
                reject('No deps found.');
            } else {
                resolve({
                    patch_path: PATCH_ACC,
                    my_deps: DEPS_FOUND,
                    deps_folder: DEPS_FOLDER,
                    patch_folder: PATCH_ACC,
                    cross_patch_deps: aux._cross,
                    patch_exec_path: PATCH_EXEC_PATH
                });
            }
        }).catch((err) => {
            console.log(err)
        });

        

    });

};

module.exports = {
    handle
}