const investments = Array.from({ length: 100000 }, () => ({
  actual_returns: Math.random() * 1000,
  expected_returns: Math.random() * 1200,
  amount: Math.random() * 10000
}));

console.time('baseline');
for(let i=0; i<100; i++) {
  const totalActualReturns = investments?.reduce((sum, inv) => sum + Number(inv.actual_returns), 0) || 0;
  const totalExpectedReturns = investments?.reduce((sum, inv) => sum + Number(inv.expected_returns), 0) || 0;
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
}
console.timeEnd('baseline');

console.time('optimized');
for(let i=0; i<100; i++) {
  let actual = 0;
  let expected = 0;
  let invested = 0;
  for (const inv of investments) {
    actual += Number(inv.actual_returns);
    expected += Number(inv.expected_returns);
    invested += Number(inv.amount);
  }
}
console.timeEnd('optimized');
