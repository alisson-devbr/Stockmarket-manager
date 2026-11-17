const API = "/api";
const $ = id => document.getElementById(id);
const money = value => Number(value || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
async function api(url,options={}) {
  const response = await fetch(url,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
  const data = response.status===204 ? null : await response.json();
  if(!response.ok) throw new Error(data?.message || "Falha na operação.");
  return data;
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2500);}
async function loadDashboard(){
  const d=await api(`${API}/dashboard`);
  $("totalProducts").textContent=d.total_products;
  $("totalUnits").textContent=Number(d.total_units).toLocaleString("pt-BR");
  $("lowStock").textContent=d.low_stock;
  $("stockValue").textContent=money(d.stock_cost_value);
  $("recentMovements").innerHTML=d.recent.length?d.recent.map(m=>`<div class="movement"><div><b>${escapeHtml(m.product_name)}</b><small>${new Date(m.created_at).toLocaleString("pt-BR")}${m.note?" · "+escapeHtml(m.note):""}</small></div><b class="${m.movement_type}">${m.movement_type==="entrada"?"+":"−"}${m.quantity} ${m.movement_type}</b></div>`).join(""):"Nenhuma movimentação registrada.";
}
async function loadProducts(){
  const list=await api(`${API}/products?search=${encodeURIComponent($("search").value)}`);
  $("productCount").textContent=`${list.length} produto(s)`;
  $("productsTable").innerHTML=list.length?list.map(p=>{const low=p.quantity<=p.min_quantity;return `<tr>
    <td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.sku)}</td><td>${escapeHtml(p.category)}</td>
    <td>${money(p.sale_price)}</td><td>${p.quantity}</td><td><span class="stock ${low?"low":""}">${low?"Estoque baixo":"Disponível"}</span></td>
    <td><button class="action" data-action="move" data-id="${p.id}">Movimentar</button><button class="action" data-action="edit" data-id="${p.id}">Editar</button><button class="action" data-action="delete" data-id="${p.id}">Excluir</button></td></tr>`;}).join(""):'<tr><td colspan="7">Nenhum produto encontrado.</td></tr>';
}
async function refresh(){try{await Promise.all([loadDashboard(),loadProducts()]);}catch(e){toast(e.message);}}
function openProduct(p=null){
  $("productForm").reset();$("productId").value=p?.id||"";$("dialogTitle").textContent=p?"Editar produto":"Novo produto";
  $("name").value=p?.name||"";$("sku").value=p?.sku||"";$("category").value=p?.category||"";
  $("costPrice").value=p?.cost_price??"";$("salePrice").value=p?.sale_price??"";
  $("quantity").value=p?.quantity??0;$("quantity").disabled=Boolean(p);$("minQuantity").value=p?.min_quantity??5;$("formMessage").textContent="";
  $("productDialog").showModal();
}
$("newProduct").addEventListener("click",()=>openProduct());
$("closeProduct").addEventListener("click",()=>$("productDialog").close());
$("cancelProduct").addEventListener("click",()=>$("productDialog").close());
$("closeMovement").addEventListener("click",()=>$("movementDialog").close());
$("cancelMovement").addEventListener("click",()=>$("movementDialog").close());
$("productForm").addEventListener("submit",async e=>{
  e.preventDefault();const id=$("productId").value;
  const body={name:$("name").value,sku:$("sku").value,category:$("category").value,cost_price:$("costPrice").value,sale_price:$("salePrice").value,quantity:$("quantity").value,min_quantity:$("minQuantity").value};
  try{await api(`${API}/products${id?"/"+id:""}`,{method:id?"PUT":"POST",body:JSON.stringify(body)});$("productDialog").close();toast(id?"Produto atualizado.":"Produto cadastrado.");await refresh();}
  catch(err){$("formMessage").textContent=err.message;}
});
$("productsTable").addEventListener("click",async e=>{
  const b=e.target.closest("button[data-action]");if(!b)return;const {action,id}=b.dataset;
  try{
    if(action==="edit"){openProduct(await api(`${API}/products/${id}`));}
    if(action==="move"){const p=await api(`${API}/products/${id}`);$("movementForm").reset();$("movementProductId").value=id;$("movementProductName").textContent=`${p.name} · Estoque atual: ${p.quantity}`;$("movementMessage").textContent="";$("movementDialog").showModal();}
    if(action==="delete"&&confirm("Excluir este produto? Produtos com movimentações anteriores não podem ser excluídos.")){await api(`${API}/products/${id}`,{method:"DELETE"});toast("Produto excluído.");await refresh();}
  }catch(err){toast(err.message);}
});
$("movementForm").addEventListener("submit",async e=>{
  e.preventDefault();try{await api(`${API}/products/${$("movementProductId").value}/movements`,{method:"POST",body:JSON.stringify({type:$("movementType").value,quantity:$("movementQuantity").value,note:$("movementNote").value})});$("movementDialog").close();toast("Movimentação registrada.");await refresh();}
  catch(err){$("movementMessage").textContent=err.message;}
});
let timer;$("search").addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(()=>loadProducts().catch(e=>toast(e.message)),250);});
refresh();
