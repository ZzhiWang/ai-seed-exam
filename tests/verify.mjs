import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {isCorrect,grade,sampleExam,filterQuestions} from '../docs/core.mjs';
const data=JSON.parse(readFileSync(new URL('../docs/questions.json',import.meta.url)));
const qs=data.questions;
assert.equal(qs.length,360);assert.equal(new Set(qs.map(q=>q.id)).size,360);
assert.deepEqual(Object.fromEntries(['single','multi','judge'].map(t=>[t,qs.filter(q=>q.type===t).length])),{single:180,multi:108,judge:72});
assert.equal(new Set(qs.map(q=>q.stem)).size,360);
for(const q of qs){
 assert(data.chapters.some(c=>c.id===q.chapter&&q.page>0&&q.page<=c.pages));
 assert(q.quote.length>0&&q.explanation.length>10);
 assert.equal(q.type==='judge'?2:4,q.options.length);
 assert(q.type==='multi'?q.answer.length>=2:q.answer.length===1);
 // Exhaustively score every possible answer set, including empty selections.
 for(let mask=0;mask<2**q.options.length;mask++){
  const selected=q.options.map((_,i)=>i).filter(i=>(mask>>i)&1);
  const expected=selected.length===q.answer.length&&selected.every(i=>q.answer.includes(i));
  assert.equal(isCorrect(selected,q.answer),expected,`${q.id} ${selected}`);
 }
 assert.equal(isCorrect([...q.answer,q.answer[0]],q.answer),false);
}
for(const count of [20,50,100])for(let n=0;n<30;n++){
 const exam=sampleExam(qs,count);assert.equal(exam.length,count);assert.equal(new Set(exam.map(q=>q.id)).size,count);assert.equal(new Set(exam.map(q=>q.chapter)).size,7);
 for(const [t,ratio] of [['single',.5],['multi',.3],['judge',.2]])assert.equal(exam.filter(q=>q.type===t).length,count*ratio);
}
assert.equal(grade(qs,Object.fromEntries(qs.map(q=>[q.id,q.answer]))).score,100);
assert.equal(grade(qs,{}).score,0);
assert.equal(grade(qs.slice(0,20),{[qs[0].id]:qs[0].answer}).score,5);
const progress={[qs[0].id]:{correct:false},[qs[1].id]:{correct:true}};
assert.equal(filterQuestions(qs,{status:'wrong'},progress).length,1);
assert.equal(filterQuestions(qs,{status:'correct'},progress).length,1);
assert.equal(filterQuestions(qs,{status:'new'},progress).length,358);
assert.equal(filterQuestions(qs,{status:'favorite'},progress,[qs[0].id]).length,1);
assert(filterQuestions(qs,{search:'SPEC'}).length>5);
for(const c of data.chapters)assert.equal(filterQuestions(qs,{chapter:c.id}).length,c.count);
console.log('PASS: 360 questions, source page bounds, all answer combinations, 90 randomized exams, scores and filters.');
