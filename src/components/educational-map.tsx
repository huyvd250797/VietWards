"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Focus, Layers3, LoaderCircle, MapPin, Minus, Plus, RotateCcw, ShieldAlert } from "lucide-react";
import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import type { LearningPeriod } from "@/lib/education-model";

type BoundaryFeature={type:"Feature";properties:{code:string;name:string;matched:boolean};geometry:{type:"Polygon"|"MultiPolygon";coordinates:unknown}};
type BoundaryCollection={type:"FeatureCollection";features:BoundaryFeature[];metadata?:{matchedCount:number;expected:number;accuracy:string}};
const SOURCE="educational-regions";
const FILL="educational-fill";
const SHADE="educational-shade";
const OUTLINE="educational-outline";
const WORLD_BOUNDS:[[number,number],[number,number]]=[[100.5,7.4],[116.9,24.7]];

function getBounds(features:BoundaryFeature[]):[[number,number],[number,number]] {
  let x0=180,y0=90,x1=-180,y1=-90;
  const visit=(node:unknown):void=>{
    if(!Array.isArray(node))return;
    if(typeof node[0]==="number"&&typeof node[1]==="number"){
      const x=node[0],y=node[1];
      if(Number.isFinite(x)&&Number.isFinite(y)){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
      return;
    }
    node.forEach(visit);
  };
  features.forEach(f=>visit(f.geometry.coordinates));
  return x0<=x1&&y0<=y1?[[x0,y0],[x1,y1]]:WORLD_BOUNDS;
}

export function EducationalMap({period,selectedCodes,onSelect,quiz=false}:{period:LearningPeriod;selectedCodes:string[];onSelect?:(code:string)=>void;quiz?:boolean}){
  const target=useRef<HTMLDivElement>(null);
  const map=useRef<MapLibreMap|null>(null);
  const clickHandler=useRef(onSelect);
  const datasetRef=useRef<BoundaryCollection|null>(null);
  const [data,setData]=useState<BoundaryCollection|null>(null);
  const [ready,setReady]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [retry,setRetry]=useState(0);
  useEffect(()=>{clickHandler.current=onSelect;},[onSelect]);

  useEffect(()=>{
    let disposed=false;
    async function start(){
      try {
        const gl=await import("maplibre-gl");
        if(disposed||!target.current)return;
        const instance=new gl.Map({container:target.current,style:{version:8,sources:{},layers:[{id:"educational-background",type:"background",paint:{"background-color":"#e7f2f6"}}]},
          center:[106.3,16],zoom:4.5,minZoom:3.3,maxZoom:11,attributionControl:false,renderWorldCopies:false,maxBounds:[[97.1,2.5],[121.5,28.5]]});
        map.current=instance;
        instance.on("load",()=>{
          if(disposed)return;
          instance.addSource(SOURCE,{type:"geojson",data:{type:"FeatureCollection",features:[]}});
          instance.addLayer({id:FILL,type:"fill",source:SOURCE,paint:{"fill-color":"#a7cadc","fill-opacity":0.95}});
          instance.addLayer({id:SHADE,type:"fill",source:SOURCE,paint:{"fill-color":"#07192a","fill-opacity":0}});
          instance.addLayer({id:OUTLINE,type:"line",source:SOURCE,paint:{"line-color":"#ffffff","line-width":1.1}});
          instance.on("click",FILL,(event)=>{
            const feature=event.features?.[0];
            if(feature?.properties?.matched&&typeof feature.properties.code==="string")clickHandler.current?.(feature.properties.code);
          });
          instance.on("mouseenter",FILL,()=>{instance.getCanvas().style.cursor="pointer";});
          instance.on("mouseleave",FILL,()=>{instance.getCanvas().style.cursor="";});
          setReady(true);
        });
        instance.on("error",(event)=>{ // MapLibre style/render errors should not silently pass.
          const message=event.error?.message??"";
          if(/webgl|failed to initialize/i.test(message))setError("Không thể khởi tạo WebGL trên thiết bị này.");
        });
      } catch { if(!disposed)setError("Trình duyệt không thể khởi tạo bản đồ tương tác."); }
    }
    void start();
    const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(()=>map.current?.resize()):null;
    if(target.current)observer?.observe(target.current);
    return ()=>{disposed=true;observer?.disconnect();map.current?.remove();map.current=null;};
  },[]);

  useEffect(()=>{
    const controller=new AbortController();
    const frame=requestAnimationFrame(()=>{
      (map.current?.getSource(SOURCE) as GeoJSONSource|undefined)?.setData({type:"FeatureCollection",features:[]});
      datasetRef.current=null;setLoading(true);setError("");setData(null);
    });
    fetch(`/api/map-boundaries?period=${period}`,{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error(`Nguồn GIS chưa khả dụng (${response.status}).`);return response.json() as Promise<BoundaryCollection>;})
      .then(collection=>{
        if(controller.signal.aborted)return;
        if(collection.type!=="FeatureCollection"||!Array.isArray(collection.features)||!collection.features.length)throw new Error("Bộ GIS không có polygon hợp lệ.");
        datasetRef.current=collection;setData(collection);setLoading(false);
      }).catch(cause=>{if(!controller.signal.aborted){setLoading(false);setError(cause instanceof Error?cause.message:"Không tải được GIS.");}});
    return ()=>{cancelAnimationFrame(frame);controller.abort();};
  },[period,retry]);

  useEffect(()=>{
    if(!ready||!data||!map.current)return;
    (map.current.getSource(SOURCE) as GeoJSONSource|undefined)?.setData(data as never);
  },[ready,data]);

  const selectedKey=selectedCodes.join(",");
  useEffect(()=>{
    const instance=map.current;
    if(!ready||!data||!instance?.getLayer(FILL))return;
    const activeCodes=selectedKey?selectedKey.split(","):[];
    const valid=activeCodes.filter(code=>data.features.some(f=>f.properties.code===code&&f.properties.matched));
    const matchColors=valid.flatMap((code,i)=>[code,i===0?"#2563eb":"#0d9488"]);
    instance.setPaintProperty(FILL,"fill-color",valid.length?["match",["get","code"],...matchColors,"#adcbd9"]:"#a7cadc");
    instance.setPaintProperty(SHADE,"fill-opacity",valid.length?["match",["get","code"],...valid.flatMap(c=>[c,0]),0.57]:0);
    instance.setPaintProperty(OUTLINE,"line-width",valid.length?["match",["get","code"],...valid.flatMap(c=>[c,2.6]),0.9]:0.9);
    const included=data.features.filter(f=>f.properties.matched&&valid.includes(f.properties.code));
    instance.resize();
    instance.fitBounds(included.length?getBounds(included):WORLD_BOUNDS,{padding:typeof window!=="undefined"&&window.innerWidth<700?25:50,maxZoom:8.5,duration:window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:520});
  },[ready,data,selectedKey]); // stable code key avoids extra camera movements

  const focus=useCallback(()=>{
    const instance=map.current;if(!instance)return;
    const features=datasetRef.current?.features.filter(f=>f.properties.matched&&selectedCodes.includes(f.properties.code))??[];
    instance.fitBounds(features.length?getBounds(features):WORLD_BOUNDS,{padding:40,maxZoom:8.5,duration:400});
  },[selectedCodes]);
  const unmapped=data&&selectedCodes.some(c=>!data.features.some(f=>f.properties.matched&&f.properties.code===c));
  return <div className="edu-map-frame">
    <div className="edu-map-header"><span><Layers3 size={15}/> {quiz?"Chọn vùng trả lời trên bản đồ":"Bản đồ so sánh địa phương"}</span><span>{data?.metadata?.matchedCount??0}/{data?.metadata?.expected??(period==="current"?34:63)} vùng GIS</span></div>
    <div ref={target} className="edu-map-canvas" role="application" aria-label={`Bản đồ GIS ${period==="current"?"34":"63"} tỉnh thành; ${quiz?"chạm vào đúng tỉnh để trả lời":"chạm một tỉnh để chọn"}`}/>
    <div className="edu-map-tools"><button type="button" aria-label="Phóng to" disabled={!ready} onClick={()=>map.current?.zoomIn()}><Plus size={16}/></button><button type="button" aria-label="Thu nhỏ" disabled={!ready} onClick={()=>map.current?.zoomOut()}><Minus size={16}/></button><button type="button" aria-label="Căn khung các địa phương" disabled={!ready} onClick={focus}><Focus size={16}/></button></div>
    {loading&&<div className="edu-map-state" role="status"><LoaderCircle size={22} className="gis-spin"/> Đang tải GIS…</div>}
    {error&&<div className="edu-map-state edu-map-failed" role="alert"><ShieldAlert size={20}/><strong>Không tải được bản đồ</strong><small>{error}</small><button type="button" onClick={()=>setRetry(x=>x+1)}><RotateCcw size={14}/> Tải lại</button></div>}
    {unmapped&&!error&&<p className="edu-map-unmapped"><MapPin size={13}/> Thiếu ranh giới GIS cho ít nhất một địa phương đang chọn.</p>}
    <div className="edu-map-caption">GIS tham khảo, chưa thay thế bản đồ pháp lý. Danh mục và thống kê vẫn có thể tra cứu khi GIS lỗi.</div>
  </div>;
}
