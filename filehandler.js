const fse = require('fs-extra')
const walk = require('walk');

const DEPS_FILE = './deps.json';
const PATCH_FOUND_FILE_JSON = './patch_deps_found.json'
const CROSS_INFO_JSON = './cross_deps.json';
const PATCH_ACC = './';
// const FILTERING_EXTENSIONS = ['ocx', 'dll', 'exe'];
const FILTERING_EXTENSIONS = ['txt', 'txt2'];

const DEPS_FOLDER = '../../MyDeps';

var PATCH_FILES = []; // files to substitute in patch folder
var DEPS_FILES = []; // deps we have in workspace


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
        if(checkFileFoundName(file)){
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
        if (checkFileFoundName(stat.name)) {
            files.push({
                name: stat.name.toLowerCase(),
                path: `${root}\\${stat.name.toLowerCase()}`
            });
        }
        next();
    });

    walker.on('end', function () {
        var aux = files;
        fse.writeFileSync(PATCH_FOUND_FILE_JSON, JSON.stringify(aux)); //for reading info purposes
        applyFilters(aux);
        fse.writeFileSync(CROSS_INFO_JSON, JSON.stringify(aux)); //for reading info purposes
        return files;
    });
}

var checkFileFoundName = (name) => {
    var extension = name.split('.')[1]; //get extension
    return FILTERING_EXTENSIONS.includes(extension); //check extensions
}

//aplica filtros, fazendo cruzando com as deps existentes
var applyFilters = (files) => {
    var valid = false;
    files.each((f) => {
        DEPS_FILES.each((dep) => {
            valid = f.name.toLowerCase().match(dep);
            if (valid) return valid; // Se faz match a um dos regex, é imediatamente válido
        });
    })
    return valid;
}


var handle = (from, to) => {
    // ler lista de dependencias da SageAcc
    return new Promise((resolve, reject) => {

        DEPS_FILES = readDepsFile();
        PATCH_FILES = findFromOldPatch();

    });

};

module.exports = {
    handle
}