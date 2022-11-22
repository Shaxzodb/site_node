// let url = `http://api.openweathermap.org/data/2.5/weather?q=Tashkent&units=imperial&appid=b98d755c8b573749da87cfc76cf9432d`


// async function Gets(){
//     let res= await fetch(url)
//     // .then((response) => response.json())
//     // .then((body) => {
//     //     return body;
//     // });
//     if (res.ok){
//         const data = await res.json();
//         console.log(data);
//         //return global.data
//     }
//     // const res = await fetch('https://nodejs.org/api/documentation.json');
//     // if (res.ok) {
//     //   const data = await res.json();
//     //   console.log(data);
//     // }
   
// }
// Gets()
const test = require('node:test');

test('top level test', async (t) => {
    await t.test('subtest 1', (t) => {
      assert.strictEqual(1, 1);
    });
  
    await t.test('subtest 2', (t) => {
      assert.strictEqual(2, 2);
    });
  });