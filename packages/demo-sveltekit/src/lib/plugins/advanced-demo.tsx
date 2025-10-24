import { useState } from 'react';
import {
  Button,
  Input,
  Switch,
  Toggle,
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormDescription,
  FormFieldErrors,
  FormButton
} from '@svelte-react-render/api';

interface FormData {
  username: string;
  email: string;
  notifications: boolean;
  marketing: boolean;
  preference: string;
}

export default function AdvancedDemo() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    notifications: false,
    marketing: false,
    preference: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    console.log('handleInputChange', field, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log('handleSubmit');
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      notifications: false,
      marketing: false,
      preference: 'email'
    });
    setSubmitted(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Advanced Components Demo</h2>
        <p className="text-sm text-muted-foreground">
          Explore Form, Switch, and Toggle components with React
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">User Profile Form</h3>

          <FormField name="username">
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                placeholder="Enter your username"
                value={formData.username}
                onChange={(value) => handleInputChange('username', value)}
              />
            </FormControl>
            <FormDescription>
              This is your public display name
            </FormDescription>
            <FormFieldErrors />
          </FormField>

          <FormField name="email">
            <FormControl>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
              />
            </FormControl>
            <FormDescription>
              We'll never share your email with anyone else
            </FormDescription>
            <FormFieldErrors />
          </FormField>
        </div>

        {/* Switches Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="notifications" className="text-sm font-medium">
                Email Notifications
              </label>
              <p className="text-xs text-muted-foreground">
                Receive email notifications about your account
              </p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications}
              onChange={(checked) => handleInputChange('notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="marketing" className="text-sm font-medium">
                Marketing Emails
              </label>
              <p className="text-xs text-muted-foreground">
                Receive marketing and promotional emails
              </p>
            </div>
            <Switch
              id="marketing"
              checked={formData.marketing}
              onChange={(checked) => handleInputChange('marketing', checked)}
            />
          </div>
        </div>

        {/* Toggles Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Communication Method</h3>

          <div className="flex gap-2">
            <Toggle
              pressed={formData.preference === 'email'}
              onClick={() => handleInputChange('preference', 'email')}
              variant="outline"
              className="flex-1"
            >
              📧 Email
            </Toggle>
            <Toggle
              pressed={formData.preference === 'sms'}
              onClick={() => handleInputChange('preference', 'sms')}
              variant="outline"
              className="flex-1"
            >
              📱 SMS
            </Toggle>
            <Toggle
              pressed={formData.preference === 'push'}
              onClick={() => handleInputChange('preference', 'push')}
              variant="outline"
              className="flex-1"
            >
              🔔 Push
            </Toggle>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <FormButton
            disabled={isSubmitting || !formData.username.trim() || !formData.email.trim()}
            onClick={handleSubmit}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </FormButton>
          <Button
            title="Reset"
            variant="secondary"
            onClick={handleReset}
            className="flex-1"
          />
        </div>
      </div>

      {/* Success Message */}
      {submitted && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs">✓</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                Form Submitted Successfully!
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Username:</strong> {formData.username}<br />
                <strong>Email:</strong> {formData.email}<br />
                <strong>Notifications:</strong> {formData.notifications ? 'Enabled' : 'Disabled'}<br />
                <strong>Marketing:</strong> {formData.marketing ? 'Enabled' : 'Disabled'}<br />
                <strong>Preference:</strong> {formData.preference}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}