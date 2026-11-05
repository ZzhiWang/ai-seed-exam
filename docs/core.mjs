export function isCorrect(selected,answer){
  return Array.isArray(selected)&&selected.length===answer.length&&new Set(selected).size===answer.length&&answer.every(i=>selected.includes(i));
}
export function shuffle(list,random=Math.random){
  const result=[...list];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function sampleExam(questions,count,random=Math.random){
  const quotas={single:Math.round(count*.5),multi:Math.round(count*.3)};
  quotas.judge=count-quotas.single-quotas.multi;
  const selected=[],used=new Set(),chapters=[...new Set(questions.map(q=>q.chapter))];
  if(count>=chapters.length)for(const chapter of shuffle(chapters,random)){
    const q=shuffle(questions.filter(q=>q.chapter===chapter&&quotas[q.type]>0),random)[0];
    if(q){selected.push(q);used.add(q.id);quotas[q.type]--;}
  }
  for(const [type,n] of Object.entries(quotas))selected.push(...shuffle(questions.filter(q=>q.type===type&&!used.has(q.id)),random).slice(0,n));
  return shuffle(selected,random);
}
export function grade(questions,answers){
  const details=questions.map(q=>({id:q.id,selected:answers[q.id]||[],correct:isCorrect(answers[q.id],q.answer)}));
  const correct=details.filter(d=>d.correct).length;
  return {total:details.length,correct,score:details.length?Math.round(correct/details.length*100):0,details};
}
export function filterQuestions(questions,{chapter='all',type='all',status='all',search=''}={},progress={},favorites=[]){
  const term=search.trim().toLowerCase();
  return questions.filter(q=>(chapter==='all'||q.chapter===chapter)&&(type==='all'||q.type===type)&&
    (status==='all'||(status==='new'&&!progress[q.id])||(status==='wrong'&&progress[q.id]?.correct===false)||(status==='correct'&&progress[q.id]?.correct===true)||(status==='favorite'&&favorites.includes(q.id)))&&
    (!term||[q.id,q.stem,q.explanation,...q.options].join(' ').toLowerCase().includes(term)));
}
