#!/usr/bin/env python3
"""Build original teaching SVGs from the tutorial's existing examples (stdlib only)."""
import argparse
import html
from pathlib import Path

OUT = Path(__file__).parent / 'assets'
BLUE, TEAL, AMBER, INK, MUTED = '#2459bb', '#137c76', '#b75524', '#19324b', '#52677d'

def text(x,y,value,cls='label',fill=INK,anchor='start'):
    return f'<text x="{x}" y="{y}" class="{cls}" fill="{fill}" text-anchor="{anchor}">{html.escape(str(value))}</text>'

def box(x,y,w,h,fill='#fff',stroke='#cbd7e5',r=12):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>'

def line(x1,y1,x2,y2,color='#a9b9cb',width=2,dash=''):
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'

def arrow(x1,y1,x2,y2,color=BLUE):
    return line(x1,y1,x2,y2,color,2.5)+f'<path d="M{x2-7} {y2-5}L{x2} {y2}L{x2-7} {y2+5}" fill="none" stroke="{color}" stroke-width="2.5"/>'

def circle(x,y,r,fill=BLUE):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'

def figure(slug,title,desc,number,height,body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 {height}" role="img" aria-labelledby="{slug}-title {slug}-desc">
<title id="{slug}-title">{html.escape(title)}</title><desc id="{slug}-desc">{html.escape(desc)}</desc>
<defs><pattern id="{slug}-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#b9c5d2" stroke-width="1"/></pattern></defs>
<style>text{{font-family:'PingFang SC','Microsoft YaHei',sans-serif}}.title{{font-size:25px;font-weight:700;letter-spacing:-.4px}}.label{{font-size:18px}}.small{{font-size:15px}}.value{{font-size:30px;font-weight:750;font-variant-numeric:tabular-nums}}.kicker{{font-size:13px;font-weight:700;letter-spacing:1.6px}}.mono{{font:17px ui-monospace,Menlo,monospace}}</style>
<rect width="800" height="{height}" rx="16" fill="#f5f8fc"/>
<path d="M28 70H772" stroke="#d9e3ef"/>
{text(28,31,'VISUAL NOTE / '+number,'kicker',BLUE)}{text(28,60,title,'title')}
{body}
</svg>'''

visuals = {}
# Opening scene: original authored illustration, redrawn with the same semantics.
b = text(28,112,'车辆向右行驶；施工区挡住当前车道','label',MUTED)
b += box(28,137,744,224,'#e0e7ef','#c5d0dd',14)
b += line(28,249,772,249,'#fff',4,'20 14')
b += line(28,153,772,153,'#bdc9d8',2)+line(28,345,772,345,'#bdc9d8',2)
b += box(428,264,218,65,'#f4e3d6','#c99272',5)
for x in [460,525,590]:
    b += f'<path d="M{x-13} 310L{x} 278L{x+13} 310Z" fill="{AMBER}"/><path d="M{x-8} 299H{x+8}" stroke="#fff" stroke-width="4"/>'
b += text(537,352,'封闭施工区','small',AMBER,'middle')
b += f'<path d="M148 292C229 292 211 194 324 194H535C623 194 621 292 726 292" fill="none" stroke="{BLUE}" stroke-width="5" stroke-dasharray="11 7"/>'
b += f'<path d="M716 285L726 292L714 297" fill="none" stroke="{BLUE}" stroke-width="3"/>'
b += text(352,179,'之后记录的专家轨迹','small',BLUE)
b += box(80,269,70,42,BLUE,BLUE,10)+box(119,275,21,30,'#a8c5ef','#a8c5ef',5)
b += line(92,267,108,267,INK,4)+line(92,313,108,313,INK,4)
b += text(114,332,'现在','small',INK,'middle')
b += box(28,389,355,96,'#fff','#c8d9ec')+box(399,389,373,96,'#e7eefb','#b3c9eb')
b += text(46,419,'模型输入','label',INK)+text(46,452,'历史图像 · 当前车速 · 导航','label',MUTED)
b += text(417,419,'训练时用于对答案','label',BLUE)+text(417,452,'专家未来轨迹；推理时拿不到','label',BLUE)
visuals['construction-scene.svg']=figure('construction-scene','现在看见什么，训练时拿什么对答案','车头朝右，前方车道被施工锥桶阻挡。蓝色虚线表示之后向左绕行再返回的专家轨迹，只作训练监督；模型输入是历史图像、当前车速和导航。','00',510,b)
# 1. Filmstrip small multiples: grouping preserves scene identity.
b = text(28,108,'先切窗口，再随机分','label',AMBER)+text(425,108,'先分场景，再生成窗口','label',TEAL)
for row,name in enumerate(['场景 A','场景 B','场景 C']):
    y=146+row*73
    b+=text(28,y+21,name,'small')+text(425,y+21,name,'small')
    for col in range(4):
        c=[BLUE,AMBER,BLUE,TEAL][(row+col)%4]
        b+=box(100+col*67,y,61,40,c,c,5)+text(130+col*67,y+26,{'#2459bb':'训','#b75524':'测','#137c76':'验'}[c],'label','#fff','middle')
        c=[BLUE,TEAL,AMBER][row]
        b+=box(497+col*61,y,55,40,c,c,5)+text(524+col*61,y+26,['训','验','测'][row],'label','#fff','middle')
    b+=line(106,y+48,354,y+48,'#8b9cb0',1)+text(228,y+65,'重叠窗口来自同一事件','small',MUTED,'middle')
b+=line(396,98,396,371,'#d2deeb',1)+text(28,409,'风险：测试窗口可能与训练窗口几乎相同。','small',AMBER)+text(425,409,'同一场景只进入一个集合。','small',TEAL)
b+=text(28,449,'分组示意，不是切分比例；还需排查跨场景近重复和其他泄漏。','small',MUTED)
visuals['scene-split.svg']=figure('scene-split','窗口很多，不代表场景彼此独立','左侧同一事件的相邻窗口混入训练、验证和测试；右侧先按场景分组，使同一场景的窗口保持同一集合归属。','01',475,b)
# 2. Time alignment: history, present, future, mask.
b = text(28,110,'同一决策时刻 t = 0，是对齐的基准','label')+line(170,156,744,156,'#7c91a8')
for x,label in [(180,'−1.0 s'),(292,'−0.5 s'),(404,'0'),(516,'+0.5 s'),(628,'+1.0 s'),(740,'+1.5 s')]:
    b+=line(x,149,x,163,'#7c91a8')+text(x,184,label,'small',MUTED,'middle')
b+=line(404,126,404,340,BLUE,2,'5 5')
for y,label in [(212,'图像 / 自车状态'),(277,'未来轨迹目标')]: b+=text(28,y+26,label,'small')
for x in [180,292,404]:
    b+=box(x-30,212,60,41,'#dce8fb',BLUE,6)+f'<path d="M{x-20} 242l12-14 9 9 9-12 12 17" fill="none" stroke="{BLUE}" stroke-width="2"/>'
for x,val in [(516,'有效'),(628,'有效'),(740,'占位')]:
    b+=box(x-31,277,62,41,'#dceeea' if val=='有效' else 'url(#time-alignment-hatch)',TEAL if val=='有效' else '#a9b9cb',6)+text(x,303,val,'small',TEAL if val=='有效' else MUTED,'middle')
b+=text(182,341,'当时可获得的输入','small',BLUE)+text(488,341,'事后可用的监督；占位不等于有效','small',TEAL)
b+=box(28,370,744,76,'#fff','#d3dfec')+text(48,399,'shape 对了，时间仍可能错。','label')+text(48,428,'教学估算：15 m/s × 0.1 s 的时间偏差 = 1.5 m 的行进距离','small',MUTED)
visuals['time-alignment.svg']=figure('time-alignment','把历史输入和未来监督放回时间轴','历史输入截止当前时刻，未来目标在之后；补齐位置仍需有效性标记。车速十五米每秒时，零点一秒对应约一点五米行进距离。','02',468,b)
# 3. Computation graph, distinct from optimizer update.
b = text(28,111,'前向计算：使用当前参数作答','label',BLUE)
for x,value,label in [(92,'2','输入 x'),(395,'0.4','预测'),(680,'0.36','平方误差')]:
    b+=circle(x,212,45,'#e0eafa' if x<600 else '#e0efec')+text(x,221,value,'value',BLUE if x<600 else TEAL,'middle')+text(x,282,label,'label',INK,'middle')
b+=arrow(143,212,225,212)+circle(261,212,30,BLUE)+text(261,220,'×','value','#fff','middle')+arrow(293,212,343,212)
b+=arrow(447,212,630,212)+text(528,191,'与目标比较','small')+text(527,326,'(0.4 − 1)² = 0.36','mono',TEAL)
b+=box(185,326,152,66,'#fff',BLUE)+text(261,351,'当前参数 w','small',MUTED,'middle')+text(261,378,'0.2','value',BLUE,'middle')+line(261,326,261,244,BLUE,2)
b+=text(552,126,'训练目标 y = 1','label',TEAL)+line(680,137,680,163,TEAL,2)+text(395,371,'2 × 0.2 = 0.4','mono',INK)+text(395,403,'算出预测和误差，还没有更新参数。','small',MUTED)
visuals['forward-graph.svg']=figure('forward-graph','输入、参数、预测、目标，各走哪条线','输入二与参数零点二相乘得到预测零点四；目标一在模型外用于比较，平方误差为零点三六。前向计算尚未优化参数。','03',443,b)
# 4. Supervision mask as matrix; correct denominator is explicit.
b = text(28,111,'每格已经是二维坐标误差平方和','label')
for col,label in enumerate(['第 1 点','第 2 点','第 3 点']): b+=text(145+col*94,152,label,'small',MUTED,'middle')
for row,(name,values) in enumerate([('A',[1,4,None]),('B',[9,None,None])]):
    y=172+row*86; b+=text(35,y+40,name,'value')
    for col,val in enumerate(values):
        x=104+col*94
        b+=box(x,y,82,65,'#dceeea' if val is not None else 'url(#mask-denominator-hatch)',TEAL if val is not None else '#a9b9cb',8)+text(x+41,y+42,str(val) if val is not None else '×','value',TEAL if val is not None else MUTED,'middle')
b+=text(104,355,'3 个有效点，3 个无效占位','small',MUTED)
b+=line(411,138,411,360,'#d0ddeb',1)
for y,head,value,color in [(166,'有效点等权','14 ÷ 3 = 4.667',TEAL),(249,'样本等权','(2.5 + 9) ÷ 2 = 5.75',BLUE),(332,'误用固定 6 个位置','14 ÷ 6 = 2.333',AMBER)]:
    b+=text(442,y,head,'small',color)+text(442,y+31,value,'label',color)
b+=box(28,389,744,62,'#fff','#d3dfec')+text(46,416,'先选清楚目标：有效点等权与样本等权，是两种不同的定义。','small')+text(46,439,'若目标是有效点等权，除以全部位置会让 padding 稀释 loss。','small',AMBER)
visuals['mask-denominator.svg']=figure('mask-denominator','mask 不只是遮住空格，它还决定分母','A的有效误差为一和四，B为九。有效点等权得到十四除三，样本等权得到五点七五；误除全部六个位置会稀释有效点目标。','04',473,b)
# 5. Quantitative loss curve from the same scalar teaching model.
b = text(28,107,'L(w) = (2w − 1)²；这里只画这个教学模型','small',MUTED)
X=lambda w: 85+470*w
Y=lambda loss: 374-215*loss
for loss in [0,.5,1]: b+=line(85,Y(loss),555,Y(loss),'#dbe4ee',1)+text(70,Y(loss)+5,f'{loss:g}','small',MUTED,'end')
b+=line(85,136,85,374,'#7c91a8')+line(85,374,570,374,'#7c91a8')+text(34,140,'损失','small')
for w in [0,.2,.5,.8,1]: b+=line(X(w),374,X(w),381,'#7c91a8')+text(X(w),403,f'{w:g}','small',MUTED,'middle')
b+=text(552,430,'参数 w','small',MUTED)
points=' '.join(('M' if i==0 else 'L')+f'{X(i/100):.2f} {Y((2*i/100-1)**2):.2f}' for i in range(101))
b+=f'<path d="{points}" fill="none" stroke="{BLUE}" stroke-width="4"/>'
for w,loss,col in [(.2,.36,AMBER),(.44,.0144,TEAL),(.5,0,'#71849a')]: b+=circle(X(w),Y(loss),6,col)
b+=line(X(.2),Y(.36),X(.2),374,AMBER,1.5,'4 4')+line(X(.44),Y(.0144),X(.44),374,TEAL,1.5,'4 4')
b+=text(94,258,'更新前','small',AMBER)+text(312,336,'更新后','small',TEAL)+arrow(X(.2)+5,344,X(.44)-7,344,TEAL)
b+=box(589,140,183,248,'#fff','#d1deeb')
for y,head,value,col in [(174,'当前 w / loss','0.2 / 0.36',AMBER),(247,'η = 0.1，g = −2.4','w → 0.44',TEAL),(320,'新的平方误差','0.0144',TEAL)]:
    b+=text(604,y,head,'small',col)+text(604,y+30,value,'label',col)
b+=text(28,465,'更新：0.2 − 0.1 × (−2.4) = 0.44；这是训练误差变化，不是驾驶能力证明。','small',MUTED)
visuals['loss-landscape.svg']=figure('loss-landscape','一次更新，就是在损失曲线上换位置','标量模型损失曲线为二乘权重减一的平方。权重从零点二更新为零点四四，损失从零点三六降到零点零一四四，曲线最小值位于零点五。','05',492,b)
# 6. Accumulation rhythm: sample exposures != unique count != updates.
b = text(28,111,'每个 microbatch：8 次样本暴露','label',BLUE)
for k in range(4):
    x=35+k*151; b+=text(x+48,155,f'读批 {k+1}','small',MUTED,'middle')
    for n in range(8): b+=circle(x+13+(n%4)*22,183+(n//4)*24,7,BLUE)
    b+=text(x+47,242,'算梯度并累加','small',MUTED,'middle')
b+=line(80,264,530,264,TEAL,3)+line(80,254,80,264,TEAL,3)+line(530,254,530,264,TEAL,3)+text(305,297,'累计 32 次样本暴露（可能重复）','label',TEAL,'middle')
b+=arrow(578,196,631,196,TEAL)+circle(690,196,43,TEAL)+text(690,207,'1','value','#fff','middle')+text(690,264,'次实际更新','small',TEAL,'middle')
b+=box(28,335,744,97,'#fff','#d1deeb')+text(46,365,'Checkpoint 是存档，不是另一种读批或更新。','label')+text(46,395,'按保存策略记录参数、优化器等状态，以及数据与配置身份。','small',MUTED)+text(46,419,'示意假设：单卡、等大小累积且正确归一化；跳过更新应单独计数。','small',MUTED)
visuals['update-rhythm.svg']=figure('update-rhythm','读了 4 批，不等于更新了 4 次','单卡每小批八次样本暴露，四小批累积梯度后仅执行一次参数更新；三十二次暴露不保证三十二条独立样本。存档按保存策略另行记录。','06',455,b)
# 7. Causal comparison: open loop vs feedback.
b = text(28,111,'开环：下一帧仍由固定日志给出','label',BLUE)
for x,label in [(40,'日志 t'),(326,'模型预测'),(607,'日志 t+1')]:
    b+=box(x,143,153,62,'#fff','#afc4df')+text(x+76,180,label,'label',BLUE,'middle')
b+=arrow(195,174,318,174)+text(244,156,'作为输入','small',MUTED,'middle')
b+=f'<path d="M116 143V124H683V143" fill="none" stroke="#93a6bc" stroke-width="2" stroke-dasharray="5 4"/>'
b+=text(469,233,'预测不改写下一帧日志','small',MUTED,'middle')
b+=line(28,263,772,263,'#d1deeb',1)+text(28,304,'闭环：动作改变状态，状态再改变输入','label',TEAL)
for x,label in [(40,'当前观测'),(326,'策略 / 规划'),(607,'执行并推进状态')]:
    b+=circle(x+76,363,58,'#e0efec')+text(x+76,370,label,'small',TEAL,'middle')
b+=arrow(176,363,266,363,TEAL)+arrow(462,363,547,363,TEAL)
b+=f'<path d="M683 422V458H116V422" fill="none" stroke="{TEAL}" stroke-width="3"/>'
b+=f'<path d="M110 432L116 422L122 432" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
b+=text(400,487,'下一次看到什么，取决于刚才怎样行动。','label',TEAL,'middle')
b+=text(28,529,'闭环还取决于控制器、动力学及其他车辆是否反应；仿真不等于实车验证。','small',MUTED)
visuals['evaluation-loops.svg']=figure('evaluation-loops','误差被记下来，还是会影响下一步','开环模型输出不改变后续日志输入；闭环执行动作推进状态，再从新状态获取观测并规划，误差可能积累。','07',555,b)
# 8. Controlled experiment matrix, no invented measured gain.
b = text(28,111,'只改变要研究的因素，其余条件尽量一致','label')
for x,label in [(36,'实验'),(181,'原始数据'),(339,'新增数据'),(500,'采样策略'),(665,'实际更新预算')]: b+=text(x,157,label,'small',MUTED)
for row,label in enumerate(['A 基线','B 加数据','C 调采样']):
    y=185+row*78; b+=box(28,y-22,744,66,'#fff','#d3dfec',8)+text(44,y+16,label,'label')
    for n in range(6): b+=circle(194+(n%3)*27,y+(n//3)*18,5,BLUE)
    if row:
        for n in range(3): b+=circle(366+n*22,y+8,6,TEAL)
    else: b+=text(383,y+15,'—','label',MUTED,'middle')
    b+=text(533,y+15,'原策略' if row<2 else '改变暴露','small',BLUE if row<2 else TEAL,'middle')
    for n in range(5): b+=box(664+n*16,y-3,11,24,'#e2eaf6',BLUE,2)
    b+=text(703,y+35,'同预算','small',MUTED,'middle')
b+=text(28,454,'B 对 A：固定预算下，加入数据的综合效果。','label',BLUE)+text(28,487,'C 对 B：同一份数据，改变暴露策略的效果与代价。','label',TEAL)
b+=text(28,529,'统一模型、处理链与评测协议；在同一批独立场景上成对评测，并报告不确定性。','small',MUTED)
visuals['controlled-trial.svg']=figure('controlled-trial','让“数据有没有用”变成可回答的实验','三组实验共享原始数据与实际更新预算。B比A增加数据，C比B只改变采样暴露；用相同独立评测协议比较，不能把多因素同时变化归因为新增数据。','08',555,b)

def main():
    check=argparse.ArgumentParser();check.add_argument('--check',action='store_true');args=check.parse_args()
    for name,svg in visuals.items():
        data=(svg+'\n').encode();p=OUT/name
        if args.check:
            if not p.exists() or p.read_bytes()!=data: raise SystemExit(f'{name} is stale; run build-visuals.py')
        else: p.write_bytes(data)
    print(('Checked' if args.check else 'Built')+f' {len(visuals)} original teaching SVGs')
if __name__=='__main__':main()
