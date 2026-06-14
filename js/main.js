const products = [
  {id:1,name:'Aurora X Smartphone',price:699,cat:'Smartphones',rating:4.5,img:'https://via.placeholder.com/400x300?text=Aurora+X'},
  {id:2,name:'NovaBook Pro 14"',price:1299,cat:'Laptops',rating:4.7,img:'https://via.placeholder.com/400x300?text=NovaBook+Pro'},
  {id:3,name:'Pulse Buds Wireless',price:129,cat:'Audio',rating:4.1,img:'https://via.placeholder.com/400x300?text=Pulse+Buds'},
  {id:4,name:'Orbit Smartwatch',price:249,cat:'Wearables',rating:4.3,img:'https://via.placeholder.com/400x300?text=Orbit+Watch'},
  {id:5,name:'Photon Camera',price:999,cat:'Cameras',rating:4.6,img:'https://via.placeholder.com/400x300?text=Photon+Camera'},
  {id:6,name:'Volt Powerbank 20000mAh',price:59,cat:'Accessories',rating:4.2,img:'https://via.placeholder.com/400x300?text=Volt+Powerbank'},
  {id:7,name:'Pulse Max Headphones',price:199,cat:'Audio',rating:4.4,img:'https://via.placeholder.com/400x300?text=Pulse+Max'},
  {id:8,name:'Glide Mouse',price:39,cat:'Accessories',rating:4.0,img:'https://via.placeholder.com/400x300?text=Glide+Mouse'},
  {id:9,name:'Edge 4K Monitor',price:499,cat:'Monitors',rating:4.5,img:'https://via.placeholder.com/400x300?text=Edge+4K'},
  {id:10,name:'Nimbus Tablet',price:549,cat:'Tablets',rating:4.2,img:'https://via.placeholder.com/400x300?text=Nimbus+Tablet'}
];

function qs(name){
  return new URLSearchParams(location.search).get(name);
}

/* Local storage management */
const storage = {
  cartKey:'gg_cart_v1', wishKey:'gg_wish_v1',
  getCart(){return JSON.parse(localStorage.getItem(this.cartKey)||'[]')},
  saveCart(v){localStorage.setItem(this.cartKey,JSON.stringify(v))},
  getWish(){return JSON.parse(localStorage.getItem(this.wishKey)||'[]')},
  saveWish(v){localStorage.setItem(this.wishKey,JSON.stringify(v))}
}

/* UI helpers */
function updateCounts(){
  const c = storage.getCart().length; const w = storage.getWish().length;
  document.querySelectorAll('#cartCount').forEach(el=>el.textContent=c);
  document.querySelectorAll('#wishCount').forEach(el=>el.textContent=w);
}

/* Render product cards into target */
function renderProducts(list, targetId){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card product';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="meta">${p.cat} · ⭐ ${p.rating}</div>
      <div class="price">$${p.price}</div>
      <div class="actions">
        <button class="cart" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="wish" onclick="toggleWish(${p.id})">♡</button>
      </div>`;
    card.querySelector('img').addEventListener('click', ()=>{ location.href=`product.html?id=${p.id}` });
    el.appendChild(card);
  });
}

function addToCart(id){
  const cart = storage.getCart(); if(!cart.includes(id)) cart.push(id); storage.saveCart(cart); updateCounts(); alert('Added to cart');
}

function toggleWish(id){
  const w = storage.getWish(); const i = w.indexOf(id);
  if(i===-1) w.push(id); else w.splice(i,1);
  storage.saveWish(w); updateCounts();
}

/* Product detail page */
function loadProductDetail(){
  const id = parseInt(qs('id')) || 0; const p = products.find(x=>x.id===id); if(!p) return;
  const el = document.getElementById('productDetail'); if(!el) return;
  el.innerHTML = `
    <div class="card"><img src="${p.img}" alt="${p.name}"></div>
    <div class="card">
      <h2>${p.name}</h2>
      <div class="meta">${p.cat} · ⭐ ${p.rating}</div>
      <div class="price">$${p.price}</div>
      <p class="muted">High-quality ${p.cat.toLowerCase()} with modern specs and great build quality.</p>
      <div class="actions">
        <button class="cart" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="wish" onclick="toggleWish(${p.id})">♡ Add to Wishlist</button>
      </div>
    </div>`;
}

/* Page wiring */
function initProductsPage(){
  const gridId = document.getElementById('productsGrid') ? 'productsGrid' : null;
  if(gridId){
    // populate categories
    const cats = ['All',...new Set(products.map(p=>p.cat))];
    const catSel = document.getElementById('categoryFilter'); if(catSel){
      cats.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; catSel.appendChild(opt); });
      catSel.addEventListener('change', applyFilters);
    }
    document.getElementById('sortBy').addEventListener('change', applyFilters);
    document.getElementById('searchInputProd').addEventListener('input', applyFilters);
    renderProducts(products.slice(0,8),'productsGrid');
    document.getElementById('resultsInfo').textContent = `${products.length} items`;
  }
}

function applyFilters(){
  let list = products.slice();
  const cat = document.getElementById('categoryFilter')?.value;
  const q = document.getElementById('searchInputProd')?.value?.toLowerCase()||'';
  const sort = document.getElementById('sortBy')?.value;
  if(cat && cat!=='All') list = list.filter(p=>p.cat===cat);
  if(q) list = list.filter(p=>p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q));
  if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
  renderProducts(list,'productsGrid');
  document.getElementById('resultsInfo').textContent = `${list.length} results`;
}

function initHomeFeatured(){
  const featured = products.slice(0,4);
  renderProducts(featured,'featured');
}

function renderCart(){
  const list = storage.getCart(); const el = document.getElementById('cartList'); if(!el) return;
  if(list.length===0){ el.innerHTML='<p>Your cart is empty.</p>'; document.getElementById('cartSummary').innerHTML=''; return; }
  const items = list.map(id=>products.find(p=>p.id===id));
  el.innerHTML = items.map(p=>`<div class="card"><h4>${p.name}</h4><div class="meta">$${p.price}</div><button onclick="removeFromCart(${p.id})" class="btn small">Remove</button></div>`).join('');
  const total = items.reduce((s,x)=>s+x.price,0);
  document.getElementById('cartSummary').innerHTML = `<div class="card"><h4>Total: $${total}</h4><button class="btn">Checkout</button></div>`;
}

function removeFromCart(id){ const c = storage.getCart(); const i = c.indexOf(id); if(i>-1) c.splice(i,1); storage.saveCart(c); updateCounts(); renderCart(); }

function renderWish(){
  const list = storage.getWish(); const el = document.getElementById('wishList'); if(!el) return;
  if(list.length===0){ el.innerHTML='<p>No items in wishlist.</p>'; return; }
  const items = list.map(id=>products.find(p=>p.id===id));
  el.innerHTML = items.map(p=>`<div class="card"><h4>${p.name}</h4><div class="meta">$${p.price}</div><div class="actions"><button class="cart" onclick="addToCart(${p.id})">Add to Cart</button><button class="btn small" onclick="removeFromWish(${p.id})">Remove</button></div></div>`).join('');
}

function removeFromWish(id){ const w = storage.getWish(); const i=w.indexOf(id); if(i>-1) w.splice(i,1); storage.saveWish(w); updateCounts(); renderWish(); }

/* Search across header */
function initHeaderSearch(){
  const s = document.getElementById('searchInput'); if(s){ s.addEventListener('keypress', e=>{ if(e.key==='Enter'){ location.href = `products.html?search=${encodeURIComponent(s.value)}` } }); }
}

/* Global init */
document.addEventListener('DOMContentLoaded', ()=>{
  updateCounts(); initHeaderSearch(); initProductsPage(); initHomeFeatured();
  if(document.getElementById('productDetail')) loadProductDetail();
  if(document.getElementById('cartList')) renderCart();
  if(document.getElementById('wishList')) renderWish();
  // populate search param on products page
  const sp = new URLSearchParams(location.search).get('search'); if(sp && document.getElementById('searchInputProd')){ document.getElementById('searchInputProd').value=sp; applyFilters(); }
});
