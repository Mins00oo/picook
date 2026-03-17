import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { shortsApi } from '../../../src/api/shortsApi';
import { isValidShortsUrl } from '../../../src/utils/validation';
import type { ShortsHistory } from '../../../src/types/shorts';

export default function ShortsScreen() {
  const router = useRouter();
  const [url, setUrl] = useState('');

  const { data: historyData } = useQuery({
    queryKey: ['shorts-history'],
    queryFn: async () => {
      const res = await shortsApi.getHistory();
      return res.data.data;
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (inputUrl: string) => {
      const res = await shortsApi.convert(inputUrl);
      return res.data.data;
    },
    onSuccess: (data) => {
      router.push({ pathname: '/(tabs)/shorts/result', params: { id: String(data.id) } });
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      const messages: Record<string, string> = {
        INVALID_YOUTUBE_URL: '유튜브 쇼츠 URL을 입력해주세요.',
        AUDIO_EXTRACTION_FAILED: '영상 음성을 추출할 수 없어요.',
        NO_AUDIO_CONTENT: '음성이 없는 영상이에요.',
        NOT_COOKING_VIDEO: '요리 영상이 아닌 것 같아요.',
        CONVERSION_TIMEOUT: '변환 시간이 너무 오래 걸려요. 다시 시도해주세요.',
        RATE_LIMIT_EXCEEDED: '요청이 너무 많아요. 잠시 후 시도해주세요.',
      };
      Alert.alert('오류', messages[code] ?? '변환에 실패했어요. 다시 시도해주세요.');
    },
  });

  const showUrlError = url.trim().length > 0 && !isValidShortsUrl(url);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      Alert.alert('알림', '복사된 URL이 없어요.');
      return;
    }
    setUrl(text);
  };

  const handleConvert = () => {
    if (!isValidShortsUrl(url)) {
      Alert.alert('알림', '유효한 유튜브 쇼츠 URL을 입력해주세요.');
      return;
    }
    convertMutation.mutate(url);
  };

  const history = historyData?.content ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>쇼츠 변환</Text>
        <Text style={styles.subtitle}>유튜브 쇼츠를 레시피로 변환해보세요</Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="유튜브 쇼츠 URL 붙여넣기"
            placeholderTextColor={Colors.textTertiary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePaste}>
            <Text style={styles.pasteText}>붙여넣기</Text>
          </TouchableOpacity>
        </View>
        {showUrlError && (
          <Text style={styles.urlError}>유튜브 쇼츠 URL을 입력해주세요</Text>
        )}
        <Button
          title="레시피로 변환"
          onPress={handleConvert}
          loading={convertMutation.isPending}
          disabled={!url.trim() || showUrlError}
          size="large"
          style={styles.convertBtn}
        />
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>최근 변환</Text>
        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 변환 기록이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }: { item: ShortsHistory }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/shorts/result',
                    params: { id: String(item.id) },
                  })
                }
              >
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {item.title ?? item.url}
                </Text>
                <Text style={styles.historyStatus}>
                  {item.status === 'COMPLETED' ? '✅' : item.status === 'FAILED' ? '❌' : '⏳'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  inputSection: {
    padding: 20,
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  pasteBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  pasteText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  urlError: {
    fontSize: 13,
    color: Colors.error,
    marginTop: -4,
  },
  convertBtn: {
    width: '100%',
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyTitle: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginRight: 12,
  },
  historyStatus: {
    fontSize: 16,
  },
});
