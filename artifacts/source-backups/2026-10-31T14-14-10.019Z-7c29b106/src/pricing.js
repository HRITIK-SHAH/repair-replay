import { products } from './products.js';
export const MAX_QUANTITY=9;
export function priceCart(cart,code='') {
 const subtotal=cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price,0);
 const discount=code.trim().toUpperCase()==='NORTH10' && subtotal>=300000 ? Math.floor(subtotal/10):0;
 const shipping=subtotal===0 || subtotal>=500000 ? 0:9900;
 return {subtotal,discount,shipping,total:subtotal-discount+shipping};
}
