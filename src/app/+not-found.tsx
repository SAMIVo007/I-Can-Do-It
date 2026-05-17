import { Link } from 'expo-router';
import { View, type ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Heading, Body } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

export default function NotFoundScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.xl,
        gap: Spacing.xl,
      } satisfies ViewStyle}
    >
      <Heading size="lg">Page not found</Heading>
      <Body secondary style={{ textAlign: 'center' }}>
        The page you're looking for doesn't exist.
      </Body>
      <Link href="/" asChild>
        <Button title="Go Home" variant="primary" onPress={() => {}} />
      </Link>
    </View>
  );
}
