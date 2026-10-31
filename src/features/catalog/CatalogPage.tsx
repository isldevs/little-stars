import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowRight, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { Modal } from '../../components/Modal';
import { catalogService } from '../../services/catalog';
import { config, money } from '../../lib/config';
import type { CatalogQuery, Product } from '../../lib/types';
import './catalog.css';

const titles:Record<string,string>={women:'The women’s collection',men:'The men’s collection',kids:'For the little ones','new-arrivals':'Something new, every day.',sale:'Good finds. Lovely prices.'};
const descriptions:Record<string,string>={women:'Effortless layers, considered details. Pieces to feel like yourself in.',men:'Easy essentials, made to move with you. Meet your new everyday favorites.',kids:'For big adventures and little moments. Soft, playful pieces for growing days.','new-arrivals':'Fresh perspectives on the pieces you’ll reach for again and again.',sale:'Timeless pieces, a little less. Find your next everyday favorite.'};
const parsePrice=(v:string|null)=>v && Number.isFinite(Number(v)) && Number(v)>=0 ? Math.round(Number(v)*100):undefined;
export default function CatalogPage(){
 const {collection}=useParams();
 const knownCollection=!collection||Object.hasOwn(titles,collection);
 const [params,setParams]=useSearchParams();
 const [result,setResult]=useState<{products:Product[];total:number}>({products:[],total:0});
 const [facets,setFacets]=useState<Product[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [mobileFilters,setMobileFilters]=useState(false);
 const [search,setSearch]=useState(params.get('q')||'');
 const [retry,setRetry]=useState(0);
 const page=Math.max(1,Number.parseInt(params.get('page')||'1')||1);
 const category=collection && ['women','men','kids'].includes(collection)?collection:params.get('category')||undefined;
 const query=useMemo<CatalogQuery>(()=>({search:params.get('q')||undefined,category:collection&&['women','men','kids'].includes(collection)?collection:params.get('category')||undefined,collection:collection==='new-arrivals'?'new-arrivals':params.get('collection')||undefined,size:params.get('size')||undefined,color:params.get('color')||undefined,minPrice:parsePrice(params.get('min')),maxPrice:parsePrice(params.get('max')),available:params.get('available')==='true',sale:collection==='sale'||params.get('sale')==='true',sort:params.get('sort')||'featured',page,limit:config.pageSize}),[params,collection,page]);
 useEffect(()=>{if(!knownCollection){setLoading(false);return}let alive=true;setLoading(true);setError('');catalogService.search(query).then(data=>{if(alive)setResult(data)}).catch(()=>{if(alive)setError('We couldn’t load this collection. Please try again.')}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[query,retry,knownCollection]);
 useEffect(()=>{catalogService.getAll().then(setFacets).catch(()=>{})},[]);
 useEffect(()=>{setSearch(params.get('q')||'')},[params]);
 const update=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value) next.set(key,value); else next.delete(key);next.delete('page');setParams(next)};
 const clear=()=>setParams(new URLSearchParams());
 const chips=Array.from(params.entries()).filter(([key])=>!['sort','page'].includes(key));
 const sizes=Array.from(new Set(facets.filter(p=>!category||p.category===category).flatMap(p=>p.sizes)));
 const colors=Array.from(new Set(facets.filter(p=>!category||p.category===category).flatMap(p=>p.colors.map(c=>c.name))));
 const pages=Math.ceil(result.total/config.pageSize);
 const filters=<div className="catalog-filter-fields">
  <div className="filter-heading"><h2>Filters</h2><button className="text-button" onClick={clear}>Clear all</button></div>
  {!collection||!['women','men','kids'].includes(collection)?<fieldset><legend>Collection</legend>{[['','All clothing'],['women','Women'],['men','Men'],['kids','Kids']].map(([v,label])=><label className="filter-check" key={label}><input type="radio" name="category" checked={(params.get('category')||'')===v} onChange={()=>update('category',v)}/>{label}</label>)}</fieldset>:null}
  <fieldset><legend>Size</legend><div className="filter-sizes">{sizes.map(s=><button key={s} className={params.get('size')===s?'selected':''} aria-pressed={params.get('size')===s} onClick={()=>update('size',params.get('size')===s?'':s)}>{s}</button>)}</div></fieldset>
  <fieldset><legend>Color</legend><select className="input" aria-label="Filter by color" value={params.get('color')||''} onChange={e=>update('color',e.target.value)}><option value="">All colors</option>{colors.map(c=><option key={c}>{c}</option>)}</select></fieldset>
  <fieldset><legend>Price range</legend><div className="price-fields"><label>From ($)<input className="input" inputMode="decimal" type="number" min="0" value={params.get('min')||''} placeholder="0" onChange={e=>update('min',e.target.value)}/></label><span>—</span><label>To ($)<input className="input" inputMode="decimal" type="number" min="0" value={params.get('max')||''} placeholder="250" onChange={e=>update('max',e.target.value)}/></label></div><p className="muted filter-note">Prices in USD</p></fieldset>
  <fieldset><legend>Availability & offers</legend><label className="filter-check"><input type="checkbox" checked={params.get('available')==='true'} onChange={e=>update('available',e.target.checked?'true':'')}/>In stock only</label><label className="filter-check"><input type="checkbox" checked={collection==='sale'||params.get('sale')==='true'} disabled={collection==='sale'} onChange={e=>update('sale',e.target.checked?'true':'')}/>On sale</label></fieldset>
 </div>;
 if(!knownCollection)return <div className="container empty-state"><span className="empty-star" aria-hidden="true">✧</span><p className="eyebrow">A LITTLE OFF THE BEATEN PATH</p><h1>That collection isn’t here.</h1><p>There’s still plenty to discover. Find your next favorite in the shop.</p><Link className="btn" to="/shop">Explore all pieces <ArrowRight size={17}/></Link></div>;
 return <div className="catalog-page container">
  <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>{collection?collection.replace('-',' '):'Shop all'}</span></nav>
  <div className="catalog-intro"><div><p className="eyebrow">THOUGHTFULLY CHOSEN. EFFORTLESSLY WORN.</p><h1 className="page-heading">{collection?titles[collection]||'Explore the collection':'Your everyday, elevated.'}</h1><p className="muted">{collection?descriptions[collection]||'Discover thoughtful clothing for all the moments that matter.':'Good things to wear, for wherever the day takes you.'}</p></div><span className="catalog-intro-star" aria-hidden="true">✧</span></div>
  <div className="collection-tabs"><Link className={!collection?'active':''} to="/shop">Shop all</Link>{[['women','Women'],['men','Men'],['kids','Kids'],['new-arrivals','New arrivals'],['sale','Sale']].map(([slug,label])=><Link className={collection===slug?'active':''} to={`/collections/${slug}`} key={slug}>{label}</Link>)}</div>
  <div className="catalog-toolbar"><form className="catalog-search" onSubmit={e=>{e.preventDefault();update('q',search.trim())}}><Search size={18}/><input aria-label="Search products" placeholder="Find your next favorite…" value={search} onChange={e=>setSearch(e.target.value)}/><button aria-label="Submit product search" type="submit"><ArrowRight size={18}/></button></form><button className="filter-mobile-btn btn-secondary" onClick={()=>setMobileFilters(true)}><SlidersHorizontal size={16}/>Filters{chips.length?` (${chips.length})`:''}</button><label className="catalog-sort">Sort by<select aria-label="Sort products" value={params.get('sort')||'featured'} onChange={e=>update('sort',e.target.value)}><option value="featured">Featured</option><option value="newest">Newest arrivals</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
  <div className="catalog-layout"><aside className="catalog-sidebar">{filters}</aside><section aria-label="Products" className="catalog-results" aria-busy={loading}>
   <div className="results-summary"><p role="status">{loading?'Finding good things…':`${result.total} ${result.total===1?'piece':'pieces'} to make your own`}</p>{chips.length>0&&<button className="text-button" onClick={clear}>Clear filters</button>}</div>
   {chips.length>0&&<div className="active-filter-chips">{chips.map(([key,value])=><button key={key} onClick={()=>update(key,'')} aria-label={`Remove ${key} ${value} filter`}>{key==='q'?`“${value}”`:key==='min'?`From ${money(Number(value)*100)}`:key==='max'?`Up to ${money(Number(value)*100)}`:key==='available'?'In stock':key==='sale'?'On sale':value}<X size={12}/></button>)}</div>}
   {error?<div className="empty-state"><h2>A small detour.</h2><p>{error}</p><button className="btn" onClick={()=>setRetry(x=>x+1)}>Try again</button></div>:loading?<div className="product-grid catalog-grid">{Array.from({length:6},(_,i)=><div className="catalog-skeleton" key={i}><div/><span/><span/></div>)}</div>:result.products.length?<><div className="product-grid catalog-grid">{result.products.map(p=><ProductCard key={p.id} product={p}/>)}</div>{pages>1&&<nav className="pagination" aria-label="Product pages"><button aria-label="Previous page" disabled={page<=1} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(page-1));setParams(next);window.scrollTo({top:200,behavior:'instant'})}}><ChevronLeft size={18}/></button>{Array.from({length:pages},(_,i)=><button key={i} aria-current={page===i+1?'page':undefined} className={page===i+1?'active':''} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(i+1));setParams(next);window.scrollTo({top:200,behavior:'instant'})}}>{i+1}</button>)}<button aria-label="Next page" disabled={page>=pages} onClick={()=>{const next=new URLSearchParams(params);next.set('page',String(page+1));setParams(next);window.scrollTo({top:200,behavior:'instant'})}}><ChevronRight size={18}/></button></nav>}</>:page>1&&result.total>0?<div className="empty-state"><Search size={34}/><h2>That page has moved on.</h2><p>There are {result.total} pieces in this selection. Start again from the first page.</p><button className="btn" onClick={()=>{const next=new URLSearchParams(params);next.delete('page');setParams(next)}}>Back to the first page</button></div>:<div className="empty-state"><Search size={34}/><h2>No pieces found. Yet.</h2><p>Try a different search or give your filters a little room.</p><button className="btn" onClick={clear}>Explore all pieces</button></div>}
  </section></div>
  <Modal open={mobileFilters} onClose={()=>setMobileFilters(false)} title="Find your perfect piece" className="mobile-filter-modal">{filters}<button className="btn filter-show-results" onClick={()=>setMobileFilters(false)}>Show {result.total} pieces <ArrowRight size={16}/></button></Modal>
 </div>
}
