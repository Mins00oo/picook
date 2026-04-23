import React, { useEffect, useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
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
import { ConfettiLane } from '../../src/components/common/ConfettiLane';
import { LevelUpModal } from '../../src/components/level/LevelUpModal';
import { useAuthStore } from '../../src/stores/authStore';
import { useOutfitMe, useOutfitCatalog, useEquippedImages } from '../../src/hooks/useOutfits';
import { toAbsoluteImageUrl } from '../../src/utils/format';
import { resizeManyForUpload } from '../../src/utils/image';
import type { CookbookEntry } from '../../src/api/cookbookApi';
import type { Outfit } from '../../src/types/outfit';

const MAX_PHOTOS = 4;
const MAX_MEMO = 200;

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
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const rId = Number(recipeId);

  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [success, setSuccess] = useState<CookbookEntry | null>(null);
  const [levelUp, setLevelUp] = useState<null | { newLevel: number | null; grantedOutfits: Outfit[] }>(null);
  const [pendingNav, setPendingNav] = useState<null | 'home' | 'cookbook'>(null);

  const authUser = useAuthStore((s) => s.user);
  const characterType = authUser?.characterType ?? 'MIN';
  const { data: outfitMe } = useOutfitMe();
  const { data: catalog } = useOutfitCatalog();
  const equippedImages = useEquippedImages(outfitMe?.equipped, catalog);

  const { data: recipe } = useQuery({
    queryKey: ['recipe', rId],
    queryFn: async () => (await recipeApi.getDetail(rId)).data.data,
    enabled: !!rId,
  });

  const createMutation = useCreateCookbookEntry();

  const canSubmit = rating > 0 && !createMutation.isPending;
  const hasUnsaved = rating > 0 || photos.length > 0 || memo.trim().length > 0;

  /**
   * 입력 중 이탈 방지 — 별점/사진/메모 중 하나라도 있으면 확인 다이얼로그.
   * 제출 성공(success != null) 후엔 스킵. submitting 중에도 스킵해서 네비게이션 락 피함.
   */
  useEffect(() => {
    if (success != null || !hasUnsaved) return;
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (createMutation.isPending) return;
      e.preventDefault();
      Alert.alert(
        '저장 안 된 기록이 있어요',
        '나가면 입력한 별점·사진·메모가 사라져요. 정말 나갈까요?',
        [
          { text: '계속 작성', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return unsub;
  }, [navigation, hasUnsaved, success, createMutation.isPending]);

  /** 닫기 버튼 (X) 탭 — 같은 확인 */
  const handleClose = () => {
    if (!hasUnsaved || success != null) {
      router.back();
      return;
    }
    Alert.alert(
      '저장 안 된 기록이 있어요',
      '나가면 입력한 별점·사진·메모가 사라져요. 정말 나갈까요?',
      [
        { text: '계속 작성', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => router.back() },
      ],
    );
  };

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
      const rawUris = result.assets.map((a) => a.uri);
      // 업로드 전 리사이즈 (1600px + JPEG 0.8) — 폰 원본이 4000px 넘어서 과다 전송 방지
      const resized = await resizeManyForUpload(rawUris);
      setPhotos((prev) => [...prev, ...resized].slice(0, MAX_PHOTOS));
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
      setSuccess(result);
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
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={8}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path d="M6 18L18 6M6 6l12 12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.dishName} numberOfLines={1}>
            {recipe?.title ?? ''}
          </Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero with confetti */}
          <View style={styles.heroWrap}>
            <ConfettiLane height={260} />
            <View style={styles.hero}>
              <View style={styles.kicker}>
                <Text style={styles.kickerText}>COOKED</Text>
              </View>
              <Text style={styles.heroTitle}>완성하셨군요!</Text>
              <Text style={styles.heroDesc}>오늘의 요리, 몇 점 주고 싶으세요?</Text>
            </View>
          </View>

          {/* 내 점수 */}
          <View style={styles.section}>
            <View style={styles.secLabel}>
              <Text style={styles.secLabelText}>내 점수</Text>
              <Text style={styles.secHint}>나만 볼 수 있어요</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.starsRow}>
                <RatingStars value={rating} onChange={setRating} size={28} spacing={12} />
              </View>
              <Text style={styles.feedback}>
                {rating > 0 ? (
                  <>
                    꽤 <Text style={styles.feedbackAccent}>{RATING_FEEDBACK[rating]?.accent}</Text>
                    <Text> · {rating}점</Text>
                  </>
                ) : (
                  <Text style={styles.feedbackMuted}>별점을 선택해 주세요</Text>
                )}
              </Text>
            </View>
          </View>

          {/* 사진 */}
          <View style={styles.section}>
            <View style={styles.secLabel}>
              <Text style={styles.secLabelText}>사진</Text>
              <Text style={styles.secHint}>최대 {MAX_PHOTOS}장</Text>
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
                    <Svg width={18} height={18} viewBox="0 0 24 24">
                      <Path d="M12 5v14M5 12h14" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                    {isFirst && (
                      <Text style={styles.photoCount}>{photos.length}/{MAX_PHOTOS}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 한 줄 메모 */}
          <View style={styles.section}>
            <View style={styles.secLabel}>
              <Text style={styles.secLabelText}>한 줄 메모</Text>
              <Text style={styles.secHint}>선택</Text>
            </View>
            <View style={styles.memoField}>
              <TextInput
                value={memo}
                onChangeText={(t) => setMemo(t.slice(0, MAX_MEMO))}
                placeholder="오늘은 어떤 요리였어요? 기억에 남는 점이 있다면 적어두세요"
                placeholderTextColor={colors.textTertiary}
                multiline
                style={styles.memoInput}
                textAlignVertical="top"
              />
              <Text style={styles.memoCounter}>{memo.length} / {MAX_MEMO}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA — gradient fade */}
        <LinearGradient
          colors={['rgba(255,248,241,0)', colors.background]}
          locations={[0, 0.25]}
          pointerEvents="box-none"
          style={[styles.bottom, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}
        >
          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
              {createMutation.isPending ? '저장 중...' : '요리북에 담기'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Success sheet (D3) */}
      <SuccessSheet
        data={success}
        recipeTitle={recipe?.title ?? ''}
        onGoHome={() => {
          if (success?.leveledUp) {
            setLevelUp({ newLevel: success.newLevel, grantedOutfits: success.grantedOutfits });
            setPendingNav('home');
            setSuccess(null);
          } else {
            setSuccess(null);
            router.replace('/(tabs)/home');
          }
        }}
        onGoCookbook={() => {
          if (success?.leveledUp) {
            setLevelUp({ newLevel: success.newLevel, grantedOutfits: success.grantedOutfits });
            setPendingNav('cookbook');
            setSuccess(null);
          } else {
            setSuccess(null);
            router.replace('/(tabs)/cookbook');
          }
        }}
      />

      <LevelUpModal
        visible={!!levelUp}
        newLevel={levelUp?.newLevel ?? null}
        grantedOutfits={levelUp?.grantedOutfits ?? []}
        characterType={characterType}
        equipped={equippedImages}
        onTryOn={() => {
          setLevelUp(null);
          setPendingNav(null);
          router.replace('/(tabs)/mypage/closet');
        }}
        onLater={() => {
          const nav = pendingNav;
          setLevelUp(null);
          setPendingNav(null);
          if (nav === 'cookbook') router.replace('/(tabs)/cookbook');
          else router.replace('/(tabs)/home');
        }}
      />
    </SafeAreaView>
  );
}

interface SuccessSheetProps {
  data: CookbookEntry | null;
  recipeTitle: string;
  onGoHome: () => void;
  onGoCookbook: () => void;
}

function SuccessSheet({ data, recipeTitle, onGoHome, onGoCookbook }: SuccessSheetProps) {
  const visible = !!data;
  const hasPhoto = (data?.photoUrls?.length ?? 0) > 0;
  const pointsEarned = data?.pointsEarned ?? 0;
  const expEarned = data?.expEarned ?? 0;
  const sequenceNumber = data?.sequenceNumber ?? null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.scrim} />
        <View style={styles.successSheet}>
          <View style={styles.successHandle} />

          {/* cookbook preview (다크 그라디언트 카드) */}
          <LinearGradient
            colors={['#1F1612', '#2F221C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.previewCard}
          >
            <View style={styles.bookIco}>
              <Svg width={26} height={26} viewBox="0 0 24 24">
                <Path
                  d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
                  stroke={colors.primary}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Path
                  d="M19 18H6a2 2 0 0 0-2 2"
                  stroke={colors.primary}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.cbKicker}>요리북에 담겼어요</Text>
              <Text style={styles.cbTitle}>
                <Text>'{recipeTitle}'이{'\n'}</Text>
                {sequenceNumber != null ? (
                  <Text style={styles.cbTitleHl}>{sequenceNumber}번째 페이지</Text>
                ) : (
                  <Text style={styles.cbTitleHl}>새 페이지</Text>
                )}
                <Text>에 기록됐어요</Text>
              </Text>
            </View>
          </LinearGradient>

          {/* 보상 칩 — 사진 있을 때만 */}
          {hasPhoto ? (
            <View style={styles.rewardRow}>
              <View style={styles.rewardChip}>
                <View style={styles.rewardIcon}>
                  <EggIcon size={16} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rewardLabel}>포인트</Text>
                  <Text style={styles.rewardValue}>+{pointsEarned}P</Text>
                </View>
              </View>
              <View style={styles.rewardChip}>
                <View style={styles.rewardIcon}>
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path
                      d="M12 2l3 6.5L22 9l-5 5 1 7-6-3-6 3 1-7-5-5 7-0.5L12 2z"
                      stroke={colors.primary}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rewardLabel}>경험치</Text>
                  <Text style={styles.rewardValue}>+{expEarned} EXP</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noRewardHint}>
              <Text style={styles.noRewardText}>
                💡 사진을 추가하면 포인트와 경험치를 받을 수 있어요
              </Text>
            </View>
          )}

          <View style={styles.successActions}>
            <TouchableOpacity style={styles.ghostBtn} onPress={onGoHome} activeOpacity={0.85}>
              <Text style={styles.ghostText}>홈으로</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={onGoCookbook} activeOpacity={0.85}>
              <Text style={styles.primaryText}>요리북 보러가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  closeBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  dishName: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },

  scrollContent: { gap: 14 },

  heroWrap: { position: 'relative' },
  hero: { alignItems: 'center', paddingTop: 20, paddingBottom: 18, gap: 4, paddingHorizontal: 24, zIndex: 2 },
  kicker: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: colors.accentSoft,
    borderRadius: 100,
    marginBottom: 12,
  },
  kickerText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: 1.6,
  },
  heroTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 36,
  },
  heroDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.textSecondary,
    letterSpacing: -0.1,
    lineHeight: 20,
    marginTop: 4,
  },

  // 섹션
  section: { paddingHorizontal: 16, gap: 10 },
  secLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
  },
  secLabelText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  secHint: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  starsRow: { alignItems: 'center', paddingVertical: 4 },
  feedback: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.textSecondary,
    minHeight: 16,
  },
  feedbackAccent: { color: colors.primary, fontFamily: fontFamily.bold },
  feedbackMuted: { color: colors.textTertiary, fontFamily: fontFamily.medium },

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
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  photoCount: {
    fontFamily: fontFamily.semibold,
    fontSize: 9.5,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(31,22,18,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoField: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    paddingRight: 16,
    minHeight: 88,
    position: 'relative',
  },
  memoInput: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
    minHeight: 60,
    paddingVertical: 0,
    paddingBottom: 20,
  },
  memoCounter: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  submitBtn: {
    height: 54,
    borderRadius: 16,
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
    fontSize: 14.5,
    color: '#fff',
    letterSpacing: -0.3,
  },
  submitTextDisabled: { color: '#fff', opacity: 0.8 },

  // D3 Success Sheet
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(31,22,18,0.35)' },
  successSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 30,
  },
  successHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 3,
    marginBottom: 16,
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 22,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  bookIco: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbKicker: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  cbTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  cbTitleHl: {
    color: colors.primary,
  },

  rewardRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  rewardChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
  },
  rewardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  rewardValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 14,
    color: colors.primary,
    letterSpacing: -0.3,
    marginTop: 1,
  },

  noRewardHint: {
    marginHorizontal: 22,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.lineSoft,
    borderRadius: 12,
  },
  noRewardText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: -0.1,
    textAlign: 'center',
    lineHeight: 18,
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
    fontSize: 13.5,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  primaryBtn: {
    flex: 1.2,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.inkDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fontFamily.bold,
    fontSize: 13.5,
    color: '#fff',
    letterSpacing: -0.2,
  },
});
