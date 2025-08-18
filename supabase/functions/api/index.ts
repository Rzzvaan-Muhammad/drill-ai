// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Hello from Functions!")

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: { ...corsHeaders } });
  }

  const url = new URL(req.url);
  let path = url.pathname;
  const basePath = '/functions/v1/api';
  if (path.startsWith(basePath)) path = path.slice(basePath.length);
  if (path.startsWith('/api')) path = path.slice('/api'.length);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

  if (req.method==="POST" && path==="/upload/complete") {
    const body = await req.json(); // { wellId, rows } rows = [{depth, sh_percent, ss_percent, ls_percent, dol_percent, anh_percent, coal_percent, salt_percent, DT, GR}]
    const rows = body.rows.map((r:any)=>({
      well_id: body.wellId,
      depth: r.depth,
      sh_percent: r.sh_percent,
      ss_percent: r.ss_percent,
      ls_percent: r.ls_percent,
      dol_percent: r.dol_percent,
      anh_percent: r.anh_percent,
      coal_percent: r.coal_percent,
      salt_percent: r.salt_percent,
      dt: r.dt,
      gr: r.gr
    }));
    const { error } = await supabase.from("tracks").insert(rows);
    if (error) return new Response(JSON.stringify({ ok:false, error:error.message }), { status:400, headers: corsHeaders });
    return new Response(JSON.stringify({ ok:true, count:rows.length }), { headers:{...corsHeaders,"content-type":"application/json"}});
  }

  const mTracks = path.match(/^\/wells\/(.+)\/tracks$/);
  if (req.method==="GET" && mTracks) {
    const wellId = decodeURIComponent(mTracks[1]);
    const { data, error } = await supabase.from("tracks").select("*").eq("well_id", wellId).order("depth",{ascending:true}).limit(5000);
    if (error) return new Response(error.message, { status:400, headers: corsHeaders });
    return new Response(JSON.stringify(data), { headers:{...corsHeaders,"content-type":"application/json"}});
  }

  if (req.method==="POST" && path==="/chat") {
    const { wellId, question } = await req.json();
    const { data } = await supabase.from("tracks").select("depth,sh_percent,ss_percent,ls_percent,dol_percent,anh_percent,coal_percent,salt_percent,dt,gr").eq("well_id", wellId).order("depth").limit(1200);
    const sys = `You are a geoscience assistant. Use the provided JSON rows to answer briefly about trends of DT and GR vs depth and composition bands.`;
    const user = `Question: ${question}\nData: ${JSON.stringify(data?.slice(0,800))}`;
    const r = await openai.chat.completions.create({ model:"gpt-4o-mini", temperature:0.2, messages:[{role:"system",content:sys},{role:"user",content:user}]});
    return new Response(JSON.stringify({ answer: r.choices[0].message.content }), { headers:{...corsHeaders,"content-type":"application/json"}});
  }

  console.log("404 Not Found for:", req.method, url.pathname);
  return new Response("Not found", { status:404, headers: corsHeaders });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/api' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
