const http=require("http"),fs=require("fs"),path=require("path");const root=process.argv[2]||require("path").join(__dirname,"../web");
const T={".html":"text/html; charset=utf-8",".js":"text/javascript",".png":"image/png",".webmanifest":"application/manifest+json"};
http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,"http://x").pathname);if(p==="/")p="/index.html";
const f=path.join(root,p);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end();}r.writeHead(200,{"content-type":T[path.extname(f)]||"application/octet-stream"});r.end(d);});}).listen(5178,()=>console.log("up"));
