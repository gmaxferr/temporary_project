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
var DEPS_FILES = []; // deps we have in workspace
const CONFIG_FILE_PATH = './config.json';

var fetchConfigs = () => {
    var result = JSON.parse(fse.readFileSync(CONFIG_FILE_PATH));
    
    DEPS_FILE = result.depsLogFile;
    PATCH_FOUND_FILE_JSON = result.patchLogFile;
    CROSS_INFO_JSON = result.crossLogFile;
    PATCH_ACC = result.folderPatch;
    FILTERING_EXTENSIONS = result.extensions;
    DEPS_FOLDER = result.folderDeps;
}


// Lê as dependencias antigas já existentes em ficheiro e armazena em 'DEPS_FILES'.
var readDepsFile = () => {
    try {
        return recheckDeps(result);
    } catch (err) {
        console.log(err);
    }

};

// Encontra os DLLs na pasta de compilações, que pertencem a SageACC
// Pesquisa utilizando filtros - myData.
var recheckDeps = (foundDeps) => {
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

    var files = [];

    // Walker options
    var walker = walk.walk(PATCH_ACC, { followLinks: false });

    walker.on('file', function (root, stat, next) {
        // Add this file to the list of files
        if (checkFileFoundName(stat.name)) { // filter extensions
            files.push({
                name: stat.name.toLowerCase(),
                path: `${root}\\${stat.name.toLowerCase()}`
            });
        }
        next();
    });

    walker.on('end', function () {
        var cross = files;
        fse.writeFileSync(PATCH_FOUND_FILE_JSON, JSON.stringify(files)); //for reading info purposes
        cross = applyFilters(cross); // retorna uma lista de cruzamento estre as dependencias para o Patch e as dependencias que temos
        fse.writeFileSync(CROSS_INFO_JSON, JSON.stringify(cross)); //for reading info purposes
        return {files: files, cross: cross};
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
    files.forEach((f) => {
        DEPS_FILES.forEach((dep) => {
            valid = f.name.match(dep.name);
            if (valid) cross.push(f); // Se faz match a um nome é imediatamente válido e é armazenado
        });
    })
    return cross;
}


var handle = () => {
    // ler lista de dependencias da SageAcc
    return new Promise((resolve, reject) => {
        if(!fse.pathExistsSync(CONFIG_FILE_PATH)){
            reject('Config.json file not found!');
        }

        fetchConfigs();
        DEPS_FILES = readDepsFile();
        var aux = findFromOldPatch();
        PATCH_FILES = aux.files;

        if (DEPS_FILES.length === 0 || PATCH_FILES.length === 0 || aux.cross.length === 0) {
            reject('No deps found.');
        } else {
            resolve({
                patch_path: PATCH_ACC,
                my_deps: DEPS_FILES,
                deps_folder: DEPS_FOLDER,
                patch_folder: PATCH_ACC,
                cross_patch_deps: aux.cross
            });
        }

    });

};

module.exports = {
    handle
}