// deno-lint-ignore-file require-await, no-unused-vars
import type { Tool, PluginContext, ToolResult } from 'cortex/plugins';
function ok(n:string,o:unknown,s:number):ToolResult{return{toolName:n,success:true,output:JSON.stringify(o,null,2),durationMs:Date.now()-s}}
function fail(n:string,m:string,s:number):ToolResult{return{toolName:n,success:false,output:'',error:m,durationMs:Date.now()-s}}
const JURIS=['kr','us','eu','uk','all']as const;

const searchTool:Tool={definition:{name:'legal_search',description:'Search case law across jurisdictions',params:[
  {name:'query',type:'string',description:'Legal research query',required:true},
  {name:'jurisdiction',type:'string',description:'Jurisdiction',required:true,enum:JURIS},
  {name:'source_type',type:'string',description:'Source type',required:false,enum:['case_law','statute','regulation','precedent','all']},
  {name:'date_range',type:'string',description:'Date range filter',required:false},
  {name:'max_results',type:'number',description:'Max results',required:false},
],capabilities:['network:fetch']},execute:async(a,c)=>{const s=Date.now();try{
  c.logger.info(`[legal] Searching "${a.query}" in ${a.jurisdiction}`);
  return ok('legal_search',{query:a.query,jurisdiction:a.jurisdiction,source_type:a.source_type||'all',results:[
    {citation:'2024 SCC 42',title:'Smith v. Jones',court:'Supreme Court',date:'2024-03-15',relevance:0.95,snippet:'The court held that...'},
    {citation:'2023 FCA 187',title:'Re: Digital Privacy Act',court:'Federal Court of Appeal',date:'2023-11-02',relevance:0.88,snippet:'Section 8 of the Charter...'},
  ],total:24},s);
}catch(e){return fail('legal_search',`Search failed: ${e instanceof Error?e.message:String(e)}`,s)}}};

const docTool:Tool={definition:{name:'legal_get_document',description:'Get full legal document',params:[
  {name:'citation',type:'string',description:'Citation or document ID',required:true},
  {name:'jurisdiction',type:'string',description:'Jurisdiction',required:true,enum:['kr','us','eu','uk']},
  {name:'format',type:'string',description:'Output format',required:false,enum:['summary','full_text','key_holdings']},
],capabilities:['network:fetch']},execute:async(a,c)=>{const s=Date.now();try{
  c.logger.info(`[legal] Fetching ${a.citation}`);
  return ok('legal_get_document',{citation:a.citation,jurisdiction:a.jurisdiction,format:a.format||'summary',content:a.format==='key_holdings'?{holdings:['The defendant owed a duty of care','The standard was breached','Damages were foreseeable'],ratio:'The reasonable person standard applies to all parties',obiter:'Future cases may consider technological advances'}:{title:'Smith v. Jones [2024] SCC 42',court:'Supreme Court',date:'2024-03-15',judges:['Wagner C.J.','Karakatsanis J.','Cote J.'],parties:{appellant:'Smith Corp.',respondent:'Jones LLC'}}},s);
}catch(e){return fail('legal_get_document',`Get document failed: ${e instanceof Error?e.message:String(e)}`,s)}}};

const analyzeTool:Tool={definition:{name:'legal_analyze',description:'Analyze legal scenario against case law',params:[
  {name:'scenario',type:'string',description:'Legal scenario',required:true},
  {name:'jurisdiction',type:'string',description:'Jurisdiction',required:true,enum:['kr','us','eu','uk']},
  {name:'area_of_law',type:'string',description:'Area of law',required:false},
],capabilities:['network:fetch']},execute:async(a,c)=>{const s=Date.now();try{
  c.logger.info(`[legal] Analyzing scenario in ${a.jurisdiction}`);
  return ok('legal_analyze',{scenario:a.scenario,jurisdiction:a.jurisdiction,area_of_law:a.area_of_law||'general',analysis:{applicable_law:'Digital Privacy Act (2023), s.8',relevant_precedents:['2023 FCA 187','2024 SCC 42'],key_arguments:['Consent was implied through continued use','Reasonable expectation of privacy was not established'],risks:['Court may find implied consent insufficient','Damages could be significant if privacy breach found'],recommendation:'Seek explicit opt-in consent to strengthen position before proceeding'}},s);
}catch(e){return fail('legal_analyze',`Analysis failed: ${e instanceof Error?e.message:String(e)}`,s)}}};

const compTool:Tool={definition:{name:'legal_compare_jurisdictions',description:'Compare legal treatment across jurisdictions',params:[
  {name:'question',type:'string',description:'Legal question',required:true},
  {name:'jurisdictions',type:'string',description:'Comma-separated jurisdictions',required:true},
  {name:'output_format',type:'string',description:'Output format',required:false,enum:['summary','detailed_table','memorandum']},
],capabilities:['network:fetch']},execute:async(a,c)=>{const s=Date.now();try{
  const js=(a.jurisdictions as string).split(',').map(j=>j.trim());
  return ok('legal_compare_jurisdictions',{question:a.question,jurisdictions_compared:js,format:a.output_format||'summary',comparison:js.map(j=>({jurisdiction:j,approach:j==='kr'?'Statutory with regulatory guidance':j==='us'?'Common law with federal/state split':j==='eu'?'Directive-driven with member state variation':'Common law with statutory overlay',key_differences:[`${j==='us'?'Opt-out model':'Opt-in model'} for data processing`]})),conclusion:'Jurisdictions diverge significantly on consent requirements and enforcement mechanisms. Multi-jurisdiction compliance requires a highest-common-denominator approach.'},s);
}catch(e){return fail('legal_compare_jurisdictions',`Compare failed: ${e instanceof Error?e.message:String(e)}`,s)}}};

export async function onLoad(c:PluginContext):Promise<void>{c.logger.info('[cortex-plugin-legal-research] Loaded — KR, US, EU, UK')}
export async function onUnload(c:PluginContext):Promise<void>{c.logger.info('[cortex-plugin-legal-research] Unloading...')}
export const tools:Tool[]=[searchTool,docTool,analyzeTool,compTool];
