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
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Simple Demo</h2>
        <p className="text-sm text-muted-foreground">
          Try entering your name and clicking the buttons below
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={name}
          onChange={(value) => setName(value)}
        />

        <div className="space-y-2">
          <Button
            title={`Click count: ${count}`}
            variant="outline"
            onClick={() => setCount(count + 1)}
            className="w-full justify-start"
          />
        </div>

        <div className="flex gap-2">
          <Button
            title="Submit"
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
          />

          <Button
            title="Reset"
            variant="secondary"
            onClick={handleReset}
            className="flex-1"
          />
        </div>
      </div>

      {showGreeting && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-sm">
              Hello, <span className="font-semibold">{name}</span>!
              You clicked the button <span className="font-semibold">{count}</span> {count === 1 ? 'time' : 'times'}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}