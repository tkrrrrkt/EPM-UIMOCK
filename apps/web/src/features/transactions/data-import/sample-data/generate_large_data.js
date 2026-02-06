const fs = require('fs');

const subjectCodes = ['1000', '2000', '3000', '4000', '4100'];
const departmentCodes = ['S01', 'S02', 'D01', 'D02'];
const projectCodes = ['PJ001', 'PJ002', 'PJ003', ''];

let csv = '科目コード,部門コード,PJコード,4月,5月,6月,7月,8月,9月,10月,11月,12月,1月,2月,3月\n';

for (let i = 0; i < 6000; i++) {
  const subject = subjectCodes[i % subjectCodes.length];
  const dept = departmentCodes[i % departmentCodes.length];
  const project = projectCodes[i % projectCodes.length];

  const amounts = [];
  for (let m = 0; m < 12; m++) {
    amounts.push(Math.floor(100000 + Math.random() * 900000));
  }

  csv += subject + ',' + dept + ',' + project + ',' + amounts.join(',') + '\n';
}

fs.writeFileSync(__dirname + '/budget_sample_large.csv', csv);
console.log('Generated 6000 rows');
