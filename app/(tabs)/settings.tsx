import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { resetDatabase } from '@/api/database';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  const handleResetData = async () => {
    await resetDatabase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ThemedText type="title" style={styles.title}>
        Settings
      </ThemedText>
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetData}
      >
        <ThemedText style={styles.buttonText}>Reset Data</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: Colors.light.tint,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 20,
  },
});
