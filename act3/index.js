const Product = require('./Product');
const model = new Product();

console.log('--- INICIO ---');

async function main() {
  // 1. Agregar productos
  const nuevo1 = await model.addProduct({
    name: 'Teclado',
    description: 'Teclado mecánico',
    price: 25000,
    stock: 25
  });
  console.log('Agregado:', nuevo1);

  const nuevo2 = await model.addProduct({
    name: 'Mouse',
    description: 'Mouse gamer',
    price: 15000,
    stock: 20
  });
  console.log('Agregado:', nuevo2);

  // 2. Mostrar todos
  const lista = await model.getProducts();
  console.table(lista);

  // 3. Buscar por id
  const buscado = await model.getProductById(nuevo1.id);
  console.log('Buscado por id:', buscado);

  // 4. Update
  const actualizado = await model.updateProductById(nuevo1.id, {
    price: 27000,
    stock: 30
  });
  console.log('Actualizado:', actualizado);

  // 5. Delete
  const borrado = await model.deleteProductById(nuevo2.id);
  console.log('Borrado?', borrado);

  // 6. Listado final
  console.table(await model.getProducts());
}

main().then(() => console.log('--- FIN ---'));
