import React, { useState } from 'react';
import { createContainer } from './reconciler';

const { container, render, clickButton } = createContainer();

const App = () => {
  const [count, setCount] = useState(0);
  console.log('App render, count:', count);
  
  return (
    <>
      count {count}
      <row>
        <button onClick={() => {
          console.log('Decrease clicked');
          setCount(p => p - 1);
        }}>Decrease</button>
        <button onClick={() => {
          console.log('Increase clicked');
          setCount(p => p + 1);
        }}>Increase</button>
      </row>
    </>
  );
};

console.log('Initial render');
render(<App />);

setTimeout(() => {
  console.log('\nInitial state:');
  console.log(JSON.stringify(container.root, null, 2));
  console.log('Button handlers:', container.buttonHandlers.size);
  
  console.log('\nClicking increase (0-1)');
  clickButton('0-1');
  
  setTimeout(() => {
    console.log('\nAfter increase:');
    console.log(JSON.stringify(container.root, null, 2));
    
    console.log('\nClicking decrease (0-0)');
    clickButton('0-0');
    
    setTimeout(() => {
      console.log('\nAfter decrease:');
      console.log(JSON.stringify(container.root, null, 2));
    }, 10);
  }, 10);
}, 10);