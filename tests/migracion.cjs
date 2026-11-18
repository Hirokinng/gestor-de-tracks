const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { abrirBiblioteca } = require('../storage');
const { iniciarServidor } = require('../server');
const { importar, huella } = require('../migracion-personal/importar.cjs');
fs.mkdirSync(path.join(__dirname, '../.tmp-ui'), {recursive:true});
const tmp = fs.mkdtempSync(path.join(__dirname, '../.tmp-ui/migracion-'));
const real = path.resolve(__dirname, '../migracion-personal');
const originales = JSON.parse(fs.readFileSync(path.join(real,'catalogo-original.json'),'utf8'));
const realDB = new DatabaseSync(path.join(real,'biblioteca/pistas.sqlite'),{readOnly:true});
const filas = realDB.prepare('SELECT * FROM pistas').all();
realDB.close();
assert.equal(filas.length,27);
for(const pista of originales){
 const local=filas.find(f=>f._id===pista._id);
 for(const key of ['titulo','artista','genero','fase','calificacion']) assert.equal(local[key],pista[key],key);
 assert.equal(local.comentario,pista.comentario||'');
}
console.log('OK los 27 registros conservan sus metadatos e identificadores originales');
const origen=path.join(tmp,'fuente/biblioteca');
fs.mkdirSync(path.join(origen,'uploads'),{recursive:true});
fs.copyFileSync(path.join(real,'biblioteca/pistas.sqlite'),path.join(origen,'pistas.sqlite'));
const archivos=filas.map((f,i)=>{
 const nombre=f.archivoAudio.slice(9);
 const ruta=path.join(origen,'uploads',nombre);
 fs.writeFileSync(ruta,'Audio simulado '+i);
 return {nombre,bytes:fs.statSync(ruta).size,sha256:huella(ruta)};
});
fs.writeFileSync(path.join(tmp,'fuente/manifest.json'),JSON.stringify({pistas:27,archivos}));
const destino=path.join(tmp,'destino');
let biblioteca=abrirBiblioteca(destino);
const nueva=biblioteca.crear({titulo:'Sesion nueva local',artista:'Prueba',genero:'Rock',fase:'Mezcla',calificacion:5,comentario:'No reemplazar'});
biblioteca.cerrar();
const resultado=importar({origen,destino});
assert.equal(resultado.importadas,27);assert.equal(resultado.total,28);assert.ok(fs.existsSync(resultado.respaldo));
biblioteca=abrirBiblioteca(destino);
assert.equal(biblioteca.obtener(nueva._id).comentario,'No reemplazar');
biblioteca.actualizar(filas[0]._id,{comentario:'Cambio local posterior'});
biblioteca.cerrar();
const repetida=importar({origen,destino});
assert.equal(repetida.importadas,0);assert.equal(repetida.yaExistentes,27);assert.equal(repetida.total,28);
biblioteca=abrirBiblioteca(destino);
assert.equal(biblioteca.obtener(filas[0]._id).comentario,'Cambio local posterior');biblioteca.cerrar();
console.log('OK importación, respaldo previo, pistas nuevas conservadas y repetición sin duplicados ni pérdida de cambios');
fs.writeFileSync(path.join(origen,'uploads',archivos[0].nombre),'Archivo alterado');
assert.throws(()=>importar({origen,destino}),/no está completa/);
console.log('OK se rechaza una copia alterada antes de modificar el destino');
const server=iniciarServidor({dataDir:path.join(real,'biblioteca')});
server.on('listening',async()=>{
 try{
  const base=`http://127.0.0.1:${server.address().port}`;
  const catalogo=await(await fetch(base+'/api/pistas')).json();assert.equal(catalogo.length,27);
  for(const pista of catalogo){
   const response=await fetch(base+pista.archivoAudio,{headers:{Range:'bytes=0-11'}});
   assert.equal(response.status,206);
   const header=Buffer.from(await response.arrayBuffer());
   assert.equal(header.toString('ascii',0,4),'RIFF');assert.equal(header.toString('ascii',8,12),'WAVE');
  }
  console.log('OK las 27 canciones y sus 27 WAV se sirven desde la nueva aplicación local');
 }catch(error){console.error(error);process.exitCode=1}finally{server.close()}
});
