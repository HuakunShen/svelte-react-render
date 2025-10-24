import { useState } from 'react';
import { Button, Input } from '@svelte-react-render/api';

export default function SimpleDemo() {
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);
  const [showGreeting, setShowGreeting] = useState(false);

  const handleSubmit = () => {
    if (name.trim()) {
      setShowGreeting(true);
    }
  };

  const handleReset = () => {
    setName('');
    setCount(0);
    setShowGreeting(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2 style={{ marginBottom: '20px' }}>Simple Demo</h2>

      <Input
        label="Your Name"
        placeholder="Enter your name"
        value={name}
        onChange={(value) => setName(value)}
      />

      <div style={{ marginTop: '16px' }}>
        <Button
          title={`Count: ${count}`}
          onClick={() => setCount(count + 1)}
        />
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <Button
          title="Submit"
          variant="primary"
          onClick={handleSubmit}
        />

        <Button
          title="Reset"
          onClick={handleReset}
        />
      </div>

      {showGreeting && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
          Hello, <strong>{name}</strong>! You clicked the button {count} times.
        </div>
      )}
    </div>
  );
}