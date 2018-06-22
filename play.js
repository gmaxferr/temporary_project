 const fse = require('fs-extra');

//  var files = [];

//  fse.readdirSync('./').forEach(file => {
//      if(file.split('.')[1] === 'js'){
//          files.push({
//              name: file
//          });
//      }
//  })

//  fse.writeFileSync('./deps.json', JSON.stringify(files));
// var data = JSON.parse(fse.readFileSync('./deps.json'))
// console.log(data)
// console.log(JSON.stringify(data, undefined, 2));

// a = fse.readdirSync('./').forEach(file => {
//     console.log(file);
//   })

// console.log(a);

// var walk    = require('walk');
// var files   = [];

// // Walker options
// var walker  = walk.walk('./', { followLinks: false });

// walker.on('file', function(root, stat, next) {
//     // Add this file to the list of files
//     if(stat.name.split('.')[1] === 'js'){
//         files.push(root + '\\' + stat.name);
//     }
//     next();
// });

// walker.on('end', function() {
//     console.log(files);
// });

// var a = ['1', '2', '3'];

// console.log(a.includes('4'));
// console.log(a.includes('1'));
