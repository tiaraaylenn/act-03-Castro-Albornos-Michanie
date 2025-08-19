const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const path = './data/products.json';

class Product {
  products = [];

  constructor(products = []) {
    this.products = products;
  }

  async readJSON() {
    try {
      const data = await fs.readFile(path, 'utf8');
      const parsed = JSON.parse(data || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      // Si no existe el archivo, devolvemos []
      if (err && err.code === 'ENOENT') return [];
      console.error('No se pudo leer los datos');
      return [];
    }
  }

  async saveJSON() {
    try {
      const data = JSON.stringify(this.products, null, 2);
      await fs.writeFile(path, data);
    } catch (error) {
      console.log('No se pudo guardar los datos');
    }
  }

  // ---- VALIDACIÓN ----
  _validateProductPayload(product, { partial = false } = {}) {
    const errs = [];
    const isNumber = (n) => typeof n === 'number' && !Number.isNaN(n);
    const isInt = (n) => Number.isInteger(n);

    if (!partial) {
      // Alta: todos obligatorios
      if (!product || typeof product !== 'object') errs.push('Producto inválido');
      if (!product?.name || typeof product.name !== 'string' || !product.name.trim()) errs.push('name requerido');
      if (!product?.description || typeof product.description !== 'string' || !product.description.trim()) errs.push('description requerido');
      if (!isNumber(product?.price) || product.price < 0) errs.push('price debe ser número >= 0');
      if (!isNumber(product?.stock) || !isInt(product.stock) || product.stock < 0) errs.push('stock debe ser entero >= 0');
    } else {
      // Update: validar sólo lo que venga
      if ('name' in product && (typeof product.name !== 'string' || !product.name.trim())) errs.push('name inválido');
      if ('description' in product && (typeof product.description !== 'string' || !product.description.trim())) errs.push('description inválido');
      if ('price' in product && (!isNumber(product.price) || product.price < 0)) errs.push('price inválido');
      if ('stock' in product && (!isNumber(product.stock) || !isInt(product.stock) || product.stock < 0)) errs.push('stock inválido');
    }
    return errs;
  }


  async addProduct(product) {
    const errors = this._validateProductPayload(product, { partial: false });
    if (errors.length) {
      console.error('Errores de validación:', errors.join(', '));
      return {};
    }

    this.products = await this.readJSON();

    let id = randomUUID();
    while (this.products.some((p) => String(p.id) === String(id))) {
      id = randomUUID();
    }

    const newProduct = {
      id,
      name: product.name.trim(),
      description: product.description.trim(),
      price: product.price,
      stock: Math.trunc(product.stock),
    };

    this.products.push(newProduct);
    await this.saveJSON();
    return newProduct;
  }

  async getProducts() {
    this.products = await this.readJSON();
    return this.products;
  }

  async getProductById(id) {
    this.products = await this.readJSON();
    const product = this.products.find((item) => String(item.id) === String(id));
    if (!product) {
      console.error('Not found'); 
      return {};
    }
    return product;
  }

  async deleteProductById(id) {
    this.products = await this.readJSON();
    const index = this.products.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      console.error('Not found'); 
      return false;
    }

    this.products.splice(index, 1);
    await this.saveJSON();
    return true;
  }

  async updateProductById(id, product) {
    this.products = await this.readJSON();
    const index = this.products.findIndex((p) => String(p.id) === String(id));

    if (index === -1) {
      console.error('Not found'); 
      return {};
    }

    const errors = this._validateProductPayload(product ?? {}, { partial: true });
    if (errors.length) {
      console.error('Errores de validación:', errors.join(', '));
      return {};
    }

    if (product?.name) {
      const dup = this.products.some(
        (p, i) =>
          i !== index &&
          p.name?.trim().toLowerCase() === product.name.trim().toLowerCase()
      );
      if (dup) {
        console.error('Ya existe un producto con ese nombre');
        return {};
      }
    }

    const current = this.products[index];
    const updated = {
      ...current,
      ...(product?.name ? { name: product.name.trim() } : {}),
      ...(product?.description ? { description: product.description.trim() } : {}),
      ...(product?.price !== undefined ? { price: product.price } : {}),
      ...(product?.stock !== undefined ? { stock: Math.trunc(product.stock) } : {}),
    };

    this.products[index] = updated;
    await this.saveJSON();
    return updated;
  }
}

module.exports = Product;



// const fs = require('fs/promises');
// const path = './data/products.json';

// class Product{
//     products = [];
//     constructor(products=[]){
//         this.products = products
//     }
//     async saveJSON(){
//         try {
//             const data = JSON.stringify( this.products, null, 2);
//             await  fs.writeFile(path, data);
//         } catch (error) {
//             console.log('No se pudo guardar los datos')
//         }
//     }
//     async readJSON(){
//         try {
//             const data = await fs.readFile(path);
//             const products = JSON.parse(data);
//             return products
//         } catch (error) {
//             console.error('No se pudo leer los datos');
//             return []
//         }
//     }
//     addProduct(product){
//         // Validar datos!
//         const id = crypto.randomUUID();
//         product.id = id;
//         this.products.push(product);
//         this.saveJSON();
//     }
//     async getProducts(){
//         this.products = await this.readJSON();
//         return this.products
//     }
//     async getProductById(id){
//         this.products = await this.readJSON();
//         const product = this.products.find( item => item.id == id );
//         return product ? product : {};
//     }
//     async deleteProductById(id) {
//         this.products = await this.readJSON();
//         const index = this.products.findIndex(p => String(p.id) === String(id));
      
//         if (index === -1) {
//           console.error('Not found');
//           return false;
//         }
      
//         this.products.splice(index, 1);
//         await this.saveJSON();
//         return true;
//       }
      
//       async updateProductById(id, product) {
//         this.products = await this.readJSON();
//         const index = this.products.findIndex(p => String(p.id) === String(id));
      
//         if (index === -1) {
//           console.error('Not found');
//           return {};
//         }
      
//         // Validación de datos parciales
//         const errors = this._validateProductPayload(product ?? {}, { partial: true });
//         if (errors.length) {
//           console.error('Errores de validación:', errors.join(', '));
//           return {};
//         }
      
//         // Control de duplicados por nombre
//         if (product?.name) {
//           const dup = this.products.some(
//             (p, i) =>
//               i !== index &&
//               p.name?.trim().toLowerCase() === product.name.trim().toLowerCase()
//           );
//           if (dup) {
//             console.error('Ya existe un producto con ese nombre');
//             return {};
//           }
//         }
      
//         // Actualización parcial
//         const current = this.products[index];
//         const updated = {
//           ...current,
//           ...(product?.name ? { name: product.name.trim() } : {}),
//           ...(product?.description ? { description: product.description.trim() } : {}),
//           ...(product?.price !== undefined ? { price: product.price } : {}),
//           ...(product?.stock !== undefined ? { stock: Math.trunc(product.stock) } : {}),
//         };
      
//         this.products[index] = updated;
//         await this.saveJSON();
//         return updated;
//       }
      
// }

// module.exports = Product;