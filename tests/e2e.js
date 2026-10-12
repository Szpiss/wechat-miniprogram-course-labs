const automator=require('miniprogram-automator'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const i=Number(process.argv[2]),names=['local-life','wedding','calculator','food-list','questionnaire','music-player'];
assert.ok(Number.isInteger(i)&&i>=1&&i<=6,'请传入实验编号1至6');
const root=path.resolve(__dirname,'..'),out=path.join(root,'screenshots',`experiment-${String(i).padStart(2,'0')}`);fs.mkdirSync(out,{recursive:true});
const results=[],errors=[];let mp,p;
async function record(name,fn){let timer;try{await Promise.race([fn(),new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('操作等待超过25秒')),25000))]);results.push({name,status:'PASS'});console.log('PASS',name)}catch(e){results.push({name,status:'FAIL',error:e.message});console.log('FAIL',name,e.message)}finally{clearTimeout(timer)}}
async function tap(selector){const el=await p.$(selector);assert.ok(el,'元素未找到 '+selector);await el.tap()}
async function input(selector,value){const el=await p.$(selector);assert.ok(el,'输入框未找到');await el.input(value)}
async function wait(fn,timeout=10000){const start=Date.now();while(Date.now()-start<timeout){if(await fn())return;await new Promise(r=>setTimeout(r,150))}throw new Error('等待超时')}
async function shot(name){if(process.env.CAPTURE!=='1')return;await p.waitFor(1200);await mp.screenshot({path:path.join(out,name+'.png')})}
async function choose(selector,type,detail){const el=await p.$(selector);assert.ok(el);await el.trigger(type,detail)}
async function route(url){await mp.evaluate(u=>{wx.switchTab({url:u});return true},url);await wait(async()=>{const q=await mp.currentPage();if(q.path===url.slice(1)){p=q;return true}return false});await p.waitFor(300);return p}
(async()=>{
 const port=i===1?9420:9420+i;try{mp=await automator.connect({wsEndpoint:'ws://127.0.0.1:'+port})}catch{try{mp=await automator.launch({projectPath:path.join(root,`experiment-${String(i).padStart(2,'0')}-${names[i-1]}`),port,trustProject:true,timeout:45000})}catch(e){console.log('等待基础库初始化',e.message);for(let retry=0;retry<35&&!mp;retry++){await new Promise(r=>setTimeout(r,1000));try{mp=await automator.connect({wsEndpoint:'ws://127.0.0.1:'+port})}catch{}}if(!mp)throw e}}
 mp.on('exception',e=>errors.push(e));p=await mp.currentPage();await p.waitFor(500);console.log('PAGE',p?.path);assert.ok(p);
 const initial=i===2?'pages/invite/invite':i===4?'pages/shoplist/shoplist':i===5?'pages/form/form':'pages/index/index';if(p.path!==initial){await mp.evaluate(u=>{wx.reLaunch({url:u});return true},'/'+initial);await wait(async()=>{const q=await mp.currentPage();if(q.path===initial){p=q;return true}return false});await p.waitFor(500)}
 if(i===1){
 await record('九宫格与轮播显示',async()=>{assert.equal((await p.$$('.service')).length,9);assert.equal((await p.data('banners')).length,3);await shot('01-home')});
 await record('昵称设置与保存',async()=>{await input('.nickname','崔子霖');await choose('.nickname','blur',{value:'崔子霖'});assert.equal((await mp.callWxMethod('getStorageSync','profile')).nickname,'崔子霖');await shot('02-profile')});
 await record('九宫格跳转和反馈',async()=>{await tap('.service[data-name="美食"]');await wait(async()=>{const page=await mp.currentPage();if(page.path==='pages/detail/detail'){p=page;return true}return false});assert.equal(await p.data('name'),'美食');await tap('.primary');await shot('03-detail')});
 }
 if(i===2){
 await record('邀请函与背景音频播放暂停',async()=>{await shot('01-invite');await tap('.music');await wait(()=>p.data('isPlayingMusic'));await shot('02-music');await tap('.music');await wait(async()=>!(await p.data('isPlayingMusic')))});
 await record('纵向照片轮播指示点',async()=>{await mp.evaluate(()=>{wx.switchTab({url:'/pages/photos/photos'});return true});await wait(async()=>{const q=await mp.currentPage();if(q.path==='pages/photos/photos'){p=q;return true}return false});const dots=await p.$$('.dot');assert.equal(dots.length,3);await dots[2].tap();assert.equal(await p.data('current'),2);await shot('03-photos')});
 await record('视频播放与暂停',async()=>{p=await route('/pages/moments/moments');const video=await p.$('video');await video.callContextMethod('play');await wait(()=>p.data('videoPlaying'));assert.equal(await p.data('error'),'');await shot('04-video');await video.callContextMethod('pause');await wait(async()=>!(await p.data('videoPlaying')))});
 await record('宾客校验与HTTP持久化提交',async()=>{p=await route('/pages/guest/guest');await tap('.primary');assert.equal(await p.data('status'),'');await input('[data-key="name"]','演示宾客');await input('[data-key="phone"]','13800138000');await input('[data-key="count"]','2');await input('[data-key="message"]','祝福新人');await tap('.primary');await wait(async()=>(await p.data('status')).includes('报名成功'));await mp.evaluate(()=>{wx.pageScrollTo({scrollTop:1200,duration:0});return true});await shot('05-guest')});
 }
 if(i===3){
 if(await p.data('theme')==='dark')await tap('.theme');
 await record('按钮输入与小数运算',async()=>{for(const k of ['AC','0','.','1','+','0','.','2','='])await tap(`[data-key="${k}"]`);assert.equal(await p.data('display'),'0.3');await shot('01-light')});
 await record('深色主题与本地记忆',async()=>{if(await p.data('theme')==='light')await tap('.theme');assert.equal(await mp.callWxMethod('getStorageSync','theme'),'dark');await shot('02-dark');assert.equal(await p.data('theme'),'dark')});
 await record('除零错误与恢复',async()=>{for(const k of ['AC','8','÷','0','='])await tap(`[data-key="${k}"]`);assert.equal(await p.data('display'),'错误');await shot('03-zero-error');await tap('[data-key="AC"]');assert.equal(await p.data('display'),'0')});
 await record('13位限制与科学计数法',async()=>{for(let n=0;n<14;n++)await tap('[data-key="9"]');assert.equal(await p.data('display'),'9999999999999');for(const k of ['×','9','='])await tap(`[data-key="${k}"]`);assert.equal(await p.data('display'),'9e+13');await shot('04-scientific')});
 }
 if(i===4){
 await input('.search','');await tap('[data-id="1"]');await wait(async()=>!(await p.data('loading')));
 await record('HTTP列表与WXS格式',async()=>{await wait(async()=>(await p.data('items')).length===5);assert.equal((await p.$('.phone')).text?await(await p.$('.phone')).text():'','138-0013-8000');await shot('01-foods')});
 await record('滚动触底分页',async()=>{const scroll=await p.$('.list');await scroll.scrollTo(0,10000);await wait(async()=>(await p.data('items')).length>=10);await shot('02-next-page');await scroll.scrollTo(0,20000);await wait(async()=>(await p.data('items')).length===12);assert.equal(await p.data('hasMore'),false)});
 await record('分类重置与双向筛选',async()=>{await tap('[data-id="5"]');await wait(async()=>(await p.data('items')).length===5&&!(await p.data('loading')));assert.ok((await p.data('items')).every(x=>x.category===5));await input('.search','豆乳');assert.ok((await p.data('filtered')).every(x=>x.name.includes('豆乳')));await shot('03-category')});
 await record('下拉刷新重新请求',async()=>{await input('.search','');const before=await p.data('refreshedAt');await choose('.list','refresherrefresh',{});await wait(async()=>(await p.data('refreshedAt'))!==before&&!(await p.data('refreshing')));assert.equal((await p.data('items')).length,5);await shot('04-refresh')});
 }
 if(i===5){
 await record('服务器问卷动态渲染',async()=>{await wait(async()=>(await p.data('questions')).length===3);assert.equal((await p.$$('radio')).length,3);assert.equal((await p.$$('checkbox')).length,5);await shot('01-form')});
 await record('空表单校验与单多选输入',async()=>{await tap('.primary');assert.equal(await p.data('status'),'');await input('[data-id="name"]','课程演示同学');await tap('radio[value="男"]');await tap('checkbox[value="JavaScript"]');await tap('checkbox[value="WXML"]');await input('textarea','希望增加更多实操案例');assert.deepEqual(await p.data('skills'),['JavaScript','WXML']);await shot('02-filled')});
 await record('HTTP提交与成功回执',async()=>{await tap('.primary');await wait(async()=>(await p.data('status')).includes('提交成功'));await mp.evaluate(()=>{wx.pageScrollTo({scrollTop:1500,duration:0});return true});await shot('03-submitted')});
 }
 if(i===6){
 await (await p.$('swiper')).swipeTo(0);await p.waitFor(1000);await tap('.playlist[data-id="all"]');await input('.search','');assert.equal(await p.data('current'),0);
 await record('服务器歌曲与搜索',async()=>{await wait(async()=>(await p.data('tracks')).length===3);await shot('01-library');await input('.search','星');assert.equal((await p.data('visible')).length,1);await shot('02-search');await input('.search','')});
 await record('歌单过滤与歌曲点击切换',async()=>{await tap('[data-id="study"]');assert.equal((await p.data('visible')).length,2);await tap('.track[data-index="0"]');await wait(()=>p.data('playing'));assert.equal(await p.data('current'),1);assert.equal((await p.data('track')).name,'晨光');await shot('03-player')});
 await record('歌词同步与进度拖动',async()=>{const slider=await p.$('slider');await slider.slideTo(9);await wait(async()=>(await p.data('position'))>=8);assert.equal(await p.data('lyricIndex'),2);await shot('04-lyrics')});
 await record('暂停下一首收藏与模式',async()=>{await tap('.play');await wait(async()=>!(await p.data('playing')));await (await p.$$('.controls button'))[2].tap();await wait(()=>p.data('playing'));assert.equal((await p.data('track')).name,'微风');await (await p.$$('.extras button'))[0].tap();if(!(await p.data('favorites')).includes(2))await (await p.$$('.extras button'))[0].tap();assert.equal((await p.data('favorites')).includes(2),true);const modes=['循环','单曲','随机'],before=await p.data('mode');await (await p.$$('.extras button'))[1].tap();assert.equal(await p.data('mode'),modes[(modes.indexOf(before)+1)%3]);await shot('05-playlist-favorite');await tap('.play')});
 await (await p.$('swiper')).swipeTo(0);await p.waitFor(1000);assert.equal(await p.data('playlist'),'study');assert.equal((await p.data('visible')).length,2);await shot('06-study-playlist');
 }
})().catch(e=>{results.push({name:'运行连接',status:'FAIL',error:e.stack});console.error(e)}).finally(async()=>{fs.mkdirSync(path.join(root,'tests'),{recursive:true});fs.writeFileSync(path.join(root,'tests',`e2e-${i}.json`),JSON.stringify({experiment:i,results,errors,at:new Date().toISOString()},null,2));if(mp)mp.disconnect();process.exit(results.some(x=>x.status==='FAIL')?1:0)});
