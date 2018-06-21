const fse = require('fs-extra')
var walk = require('walk');

const DEPS_FILE = './deps.json';
const PATCH_ACC = './';
const FILTERING_EXTENSIONS = ['ocx', 'dll', 'exe'];
const FILTERING_IN_NAME_START = ['.\/.+\/Sage\..*\.(dll|ocx|exe)']; //exemplo: ./.../Sage.AGES.GesAPI.dll 
const FILTERING_IN_NAME_MIDDLE = ['ACTB', 'AGES', 'AGEP', 'AGOP', ''];

file_template = [{
    name: '',
    location: ''
}];

var myData = file_template;
var patchData = file_template;

// Lê as dependencias antigas já existentes em ficheiro e armazena em 'myData'.
var readOld = () => {

    try {
        return JSON.parse(fse.readFileSync(DEPS_FILE));
    } catch (err) {
        console.log(err);
    }
};

// Encontra os DLLs na pasta de compilações, que pertencem a SageACC
// Pesquisa utilizando filtros - myData.
var recheckDeps = () => {

}

// Encontra os DLLs na pasta da Patch e guarda tanto o seu caminho como
// guarda o nome - patchData.
var findFromOldPatch = () => {
    
    var files = [];
    
    // Walker options
    var walker  = walk.walk(PATCH_ACC, { followLinks: false });
    
    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        checkFileFoundName(stat.name) ? files.push(root + '\\' + stat.name):;
        next();
    });
    
    walker.on('end', function() {
        applyFilters(files);
    });

}

var checkFileFoundName = (name) => {
    var extension = name.split('.')[1]; //get extension
    return FILTERING_EXTENSIONS.includes(extension); //check extensions
}

//aplica filtros de regex aos ficheiros obtidos
var applyFilters = (files) => {
    valid = false;
    files.each((f) => {
        FILTERING_regexs.each((rex) =>{
            valid = f.match(rex);
            if(valid) return valid;
        });
    })
    return valid;
}


var handle = (from, to) => {
    var deps = readOld();
    if(deps.length === 0){
        deps = recheckDeps();
    }

    var found = findFromOldPatch();




};

module.exports = {
    handle
}