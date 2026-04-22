import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, fontFamily, shadow } from '../../src/constants/theme';
import { recipeApi } from '../../src/api/recipeApi';
import { useCreateCookbookEntry } from '../../src/hooks/useCookbook';
import { RatingStars } from '../../src/components/cookbook/RatingStars';
import { EggIcon } from '../../src/components/points/EggIcon';
import { toAbsoluteImageUrl } from '../../src/utils/format';

const MAX_PHOTOS = 4;
const MAX_MEMO = 500;

const RATING_FEEDBACK: Record<number, { accent: string }> = {
  0: { accent: '' },
  1: { accent: '아쉬웠어요' },
  2: { accent: '그럭저럭' },
  3: { accent: '괜찮았어요' },
  4: { accent: '맛있었어요' },
  5: { accent: '완벽했어요' },
};

export default function CookbookReviewScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rId = Number(recipeId);

  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [success, setSuccess] = useState<null | { pointsEarned: number; cookbookId: number }>(null);

  const { data: recipe } = useQuery({
    queryKey: ['recipe', rId],
    queryFn: async () => (await recipeApi.getDetail(rId)).data.data,
    enabled: !!rId,
  });

  const createMutation = useCreateCookbookEntry();

  const canSubmit = rating > 0 && !createMutation.isPending;

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 앨범 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setPhotos((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !rId) return;
    try {
      const result = await createMutation.mutateAsync({
        recipeId: rId,
        rating,
        memo: memo.trim() || undefined,
        photoUris: photos,
      });
      setSuccess({ pointsEarned: result.pointsEarned ?? 20, cookbookId: result.id });
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? '저장에 실패했어요';
      Alert.alert('오류', msg);
    }
  };

  const placeholders = useMemo(
    () => Array.from({ length: MAX_PHOTOS - photos.length }),
    [photos.length],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path d="M6 18L18 6M6 6l12 12" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.kicker}>
              <Text style={styles.kickerText}>COOKED</Text>
            </View>
            <Text style={styles.heroTitle}>완성하셨군요!</Text>
            <Text style={styles.heroDesc}>오늘의 요리, 몇 점 주고 싶으세요?</Text>
          </View>

          {/* Rating card */}
          <View style={styles.card}>
            {recipe && (
              <Text style={styles.recipeLabel} numberOfLines={1}>{recipe.title}</Text>
            )}
            <View style={styles.starsRow}>
              <RatingStars value={rating} onChange={setRating} size={36} spacing={10} />
            </View>
            {rating > 0 && (
              <Text style={styles.feedback}>
                <Text style={styles.feedbackAccent}>{RATING_FEEDBACK[rating]?.accent}</Text>
                <Text> · {rating}점</Text>
              </Text>
            )}
          </View>

          {/* Photos */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>사진</Text>
              <Text style={styles.cardSub}>{photos.length}/{MAX_PHOTOS}</Text>
            </View>
            <View style={styles.photoGrid}>
              {photos.map((uri, i) => (
                <View key={`${uri}_${i}`} style={styles.photoCell}>
                  <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)} hitSlop={6}>
                    <Svg width={10} height={10} viewBox="0 0 24 24">
                      <Path d="M6 6l12 12M6 18l12-12" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              ))}
              {placeholders.map((_, i) => {
                const isFirst = i === 0 && photos.length < MAX_PHOTOS;
                return (
                  <TouchableOpacity
                    key={`p_${i}`}
                    style={[styles.photoCell, styles.photoEmpty, !isFirst && { opacity: 0.5 }]}
                    onPress={pickImage}
                    disabled={!isFirst}
                    activeOpacity={0.7}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path d="M12 5v14M5 12h14" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Memo */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>한 줄 메모</Text>
              <Text style={styles.cardSub}>{memo.length}/{MAX_MEMO}</Text>
            </View>
            <TextInput
              value={memo}
              onChangeText={(t) => setMemo(t.slice(0, MAX_MEMO))}
              placeholder="오늘 요리에 대한 간단한 감상을 남겨보세요 (선택)"
              placeholderTextColor={colors.textTertiary}
              multiline
              style={styles.memoInput}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
              {createMutation.isPending ? '저장 중...' : '요리북에 저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success sheet (D3) */}
      <SuccessSheet
        data={success}
        recipeThumb={toAbsoluteImageUrl(recipe?.thumbnailUrl ?? recipe?.imageUrl)}
        onGoHome={() => {
          setSuccess(null);
          router.replace('/(tabs)/home');
        }}
        onGoCookbook={() => {
          setSuccess(null);
          router.replace('/(tabs)/cookbook');
        }}
      />
    </SafeAreaView>
  );
}

interface SuccessSheetProps {
  data: null | { pointsEarned: number; cookbookId: number };
  recipeThumb: string | null;
  onGoHome: () => void;
  onGoCookbook: () => void;
}

function SuccessSheet({ data, recipeThumb, onGoHome, onGoCookbook }: SuccessSheetProps) {
  const visible = !!data;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.scrim} />
        <View style={styles.successSheetWrap}>
          <LinearGradient
            colors={['#2A1A14', colors.inkDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.successSheet}
          >
            <View style={styles.successHandle} />
            <View style={styles.successHeader}>
              <View style={styles.confettiRow}>
                <Text style={{ fontSize: 22 }}>🎉</Text>
                <Text style={{ fontSize: 16, marginTop: -4 }}>✨</Text>
                <Text style={{ fontSize: 22 }}>🎊</Text>
              </View>
              <Text style={styles.successTitle}>
                요리북에 <Text style={{ color: colors.primary }}>저장됐어요</Text>
              </Text>
              <Text style={styles.successDesc}>오늘의 요리, 잘 기록됐습니다</Text>
            </View>

            {recipeThumb && (
              <View style={styles.previewCard}>
                <Image source={{ uri: recipeThumb }} style={styles.previewThumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewHint}>MY COOKBOOK</Text>
                  <Text style={styles.previewTitle}>새 기록이 추가됐어요</Text>
                </View>
              </View>
            )}

            <View style={styles.rewardGrid}>
              <View style={styles.rewardChip}>
                <View style={styles.rewardIcon}>
                  <EggIcon size={24} withFace />
                </View>
                <Text style={styles.rewardLabel}>계란 포인트</Text>
                <Text style={styles.rewardValue}>+{data?.pointsEarned ?? 20}P</Text>
              </View>
              <View style={styles.rewardChip}>
                <View style={styles.rewardIcon}>
                  <Text style={{ fontSize: 22 }}>🍳</Text>
                </View>
                <Text style={styles.rewardLabel}>요리 횟수</Text>
                <Text style={styles.rewardValue}>+1회</Text>
              </View>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity style={styles.ghostBtn} onPress={onGoHome} activeOpacity={0.85}>
                <Text style={styles.ghostText}>홈으로</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={onGoCookbook} activeOpacity={0.85}>
                <Text style={styles.primaryText}>내 요리북 보기</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: 16, gap: 14 },

  hero: { alignItems: 'center', paddingTop: 8, paddingBottom: 14, gap: 6 },
  kicker: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: 100,
  },
  kickerText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: '#fff',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.heroTitle,
    fontSize: 30,
    color: colors.textPrimary,
    marginTop: 6,
  },
  heroDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.textSecondary,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.sm,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardSub: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
  },

  recipeLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  starsRow: { alignItems: 'center', paddingVertical: 6 },
  feedback: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  feedbackAccent: { color: colors.primary, fontFamily: fontFamily.bold },

  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  photoCell: {
    width: '23.5%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoEmpty: {
    backgroundColor: colors.lineSoft,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(31,22,18,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoInput: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
    minHeight: 88,
    paddingVertical: 0,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.cta,
  },
  submitBtnDisabled: {
    backgroundColor: '#D4C6BC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#fff',
    letterSpacing: -0.3,
  },
  submitTextDisabled: { color: '#fff', opacity: 0.8 },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,22,18,0.35)' },
  successSheetWrap: { width: '100%' },
  successSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    paddingTop: 12,
  },
  successHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 16,
  },
  successHeader: { alignItems: 'center', paddingHorizontal: 24, gap: 4, marginBottom: 18 },
  confettiRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
  successTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: '#fff',
    letterSpacing: -0.6,
  },
  successDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 22,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  previewThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#444' },
  previewHint: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  previewTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },

  rewardGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    marginBottom: 18,
  },
  rewardChip: {
    flex: 1,
    padding: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  rewardLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  rewardValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: colors.primary,
    letterSpacing: -0.3,
  },

  successActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
  },
  ghostBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  primaryBtn: {
    flex: 1.4,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#fff',
  },
});
