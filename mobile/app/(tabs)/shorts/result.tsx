import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../../src/constants/colors';
import { Button } from '../../../src/components/common/Button';
import { Loading } from '../../../src/components/common/Loading';
import { ErrorScreen } from '../../../src/components/common/ErrorScreen';
import { shortsApi } from '../../../src/api/shortsApi';

export default function ShortsResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shorts', id],
    queryFn: async () => {
      const res = await shortsApi.getDetail(Number(id));
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="변환 결과를 불러오는 중..." />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorScreen
          message="변환 결과를 불러오지 못했어요"
          onRetry={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const recipe = data.recipe;
  if (!recipe) return <ErrorScreen message="레시피 데이터가 없습니다" />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>변환 결과</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.desc}>{recipe.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료</Text>
          {recipe.ingredients.map((ing, i) => (
            <Text key={i} style={styles.ingredientText}>• {ing}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>조리 순서</Text>
          {recipe.steps.map((step) => (
            <View key={step.stepNumber} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepEmoji}>
                  {step.type === 'WAIT' ? '⏱️' : '🔥'}
                </Text>
                <Text style={styles.stepNum}>Step {step.stepNumber}</Text>
                {step.durationSeconds && (
                  <Text style={styles.stepTime}>
                    {Math.ceil(step.durationSeconds / 60)}분
                  </Text>
                )}
              </View>
              <Text style={styles.stepDesc}>{step.instruction}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="즐겨찾기 저장"
          onPress={() => Alert.alert('알림', '쇼츠 레시피 즐겨찾기 기능은 준비 중입니다.')}
          variant="outline"
          size="medium"
          style={styles.halfBtn}
        />
        <Button
          title="코칭 시작"
          onPress={() => Alert.alert('알림', '쇼츠 레시피 코칭 기능은 준비 중입니다.')}
          size="medium"
          style={styles.halfBtn}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  desc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepEmoji: {
    fontSize: 16,
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  stepTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  stepDesc: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  halfBtn: {
    flex: 1,
  },
});
