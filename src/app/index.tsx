import { Redirect } from 'expo-router';
import { useStorage } from '@/hooks/use-storage';

export default function Index() {
  const [hasOnboarded] = useStorage('hasOnboarded', false);

  if (hasOnboarded) {
    return <Redirect href="/(tabs)/(today)" />;
  }
  
  return <Redirect href="/(onboarding)" />;
}
