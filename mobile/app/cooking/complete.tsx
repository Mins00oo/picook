import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Button } from '../../src/components/common/Button';
import { cookingApi } from '../../src/api/cookingApi';
import { coachingApi } from '../../src/api/coachingApi';
import { useAuthStore } from '../../src/stores/authStore';
import { getLevelForCount, getNextLevel, getLevelProgress } from '../../src/constants/levels';
import { formatTime, toAbsoluteImageUrl } from '../../src/utils/format';
import { Colors } from '../../src/constants/colors';
import type { PhotoUploadResponse } from '../../src/types/cooking';

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CompleteScreen() {
  const { recipeId, recipeTitle, elapsed, coachingId } = useLocalSearchParams<{
    recipeId: string;
    recipeTitle?: string;
    elapsed: string;
    coachingId: string;
  }>();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadResult, setUploadResult] = useState<PhotoUploadResponse | null>(null);
  const [uploadFailed, setUploadFailed] = useState(false);

  // ─── 화면 진입 시 즉시 코칭 완료 처리 ───
  useEffect(() => {
    if (!coachingId || isCompleted) return;
    coachingApi.complete(Number(coachingId), {
      actualSeconds: Number(elapsed),
    }).then(() => {
      setIsCompleted(true);
    }).catch(() => {
      setIsCompleted(true); // 이미 완료된 경우
    });
  }, [coachingId]);

  // ─── 사진 선택 ───
  const handlePickPhotos = useCallback(async () => {
    const remaining = MAX_PHOTOS - photoUris.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });

    if (result.canceled || !result.assets.length) return;

    const validUris: string[] = [];
    for (const asset of result.assets) {
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Alert.alert('사진이 너무 커요', '최대 10MB까지 업로드할 수 있어요.');
        continue;
      }
      validUris.push(asset.uri);
    }

    if (validUris.length > 0) {
      setPhotoUris((prev) => [...prev, ...validUris].slice(0, MAX_PHOTOS));
    }
  }, [photoUris.length]);

  // ─── 사진 제거 ───
  const handleRemovePhoto = useCallback((index: number) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── 사진 업로드 + 완료 ───
  const uploadMutation = useMutation({
    mutationFn: async (uris: string[]) => {
      const total = uris.length;
      setUploadProgress({ current: 0, total });
      setUploadFailed(false);

      const formData = new FormData();
      uris.forEach((uri, idx) => {
        formData.append('files', {
          uri,
          name: `cooking_photo_${idx + 1}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      setUploadProgress({ current: total, total });
      const res = await cookingApi.uploadPhotos(Number(coachingId), formData);
      return res.data.data;
    },
    onSuccess: (data) => {
      setUploadProgress(null);
      setUploadResult(data);
      // 서버 응답으로 등급 업데이트
      if (user) {
        setUser({
          ...user,
          completedCookingCount: data.completedCookingCount,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => {
      setUploadProgress(null);
      setUploadFailed(true);
      Alert.alert('업로드 실패', '사진 업로드에 실패했어요. 다시 시도해주세요.');
    },
  });

  const handleUploadAndComplete = () => {
    if (photoUris.length === 0) return;
    uploadMutation.mutate(photoUris);
  };

  const handleRetryUpload = () => {
    if (photoUris.length === 0) return;
    uploadMutation.mutate(photoUris);
  };

  const handleSkipPhoto = () => {
    queryClient.invalidateQueries({ queryKey: ['recipe'] });
    router.replace('/(tabs)/home');
  };

  const handleDone = () => {
    queryClient.invalidateQueries({ queryKey: ['recipe'] });
    router.replace('/(tabs)/home');
  };

  // ─── 등급 계산 ───
  const newCount = uploadResult
    ? uploadResult.completedCookingCount
    : (user?.completedCookingCount ?? 0);
  const prevCount = Math.max(0, (user?.completedCookingCount ?? 0) - 1);
  const currentLevel = uploadResult
    ? { level: uploadResult.level, title: uploadResult.title, emoji: uploadResult.emoji, min: 0 }
    : getLevelForCount(newCount);
  const prevLevel = getLevelForCount(prevCount);
  const nextLevel = getNextLevel(getLevelForCount(newCount));
  const leveledUp = uploadResult
    ? uploadResult.level > prevLevel.level
    : (isCompleted && currentLevel.level > prevLevel.level);
  const progress = getLevelProgress(newCount);

  const title = recipeTitle || '요리';
  const isUploading = uploadMutation.isPending;
  const isUploadDone = !!uploadResult;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ─── 축하 헤더 ─── */}
        <Text style={styles.emoji}>🎊</Text>
        <Text style={styles.heading}>요리 완성!</Text>
        <Text style={styles.recipeName}>{title}</Text>

        {/* ─── 요리 요약 카드 ─── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>소요 시간</Text>
              <Text style={styles.summaryValue}>{formatTime(Number(elapsed))}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>누적 요리</Text>
              <Text style={styles.summaryValue}>{newCount}회</Text>
            </View>
          </View>
        </View>

        {/* ─── 레벨업 카드 ─── */}
        {leveledUp ? (
          <View style={styles.levelUpCard}>
            <Text style={styles.levelUpBadge}>🎉 레벨 업!</Text>
            <Text style={styles.levelUpEmoji}>{currentLevel.emoji}</Text>
            <Text style={styles.levelUpTitle}>
              Lv.{currentLevel.level} {currentLevel.title}
            </Text>
            <Text style={styles.levelUpDesc}>
              축하해요! 한 단계 성장했어요
            </Text>
          </View>
        ) : (
          /* ─── 등급 진행률 ─── */
          <View style={styles.rankCard}>
            <View style={styles.rankHeader}>
              <Text style={styles.rankEmoji}>{currentLevel.emoji}</Text>
              <View>
                <Text style={styles.rankTitle}>
                  Lv.{currentLevel.level} {currentLevel.title}
                </Text>
                {nextLevel && (
                  <Text style={styles.rankNext}>
                    다음: Lv.{nextLevel.level} {nextLevel.title} ({nextLevel.min - newCount}회 남음)
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}

        {/* ─── 사진 업로드 ─── */}
        <View style={styles.photoCard}>
          <Text style={styles.photoTitle}>📷 완성 사진</Text>
          <Text style={styles.photoDesc}>
            사진을 올리면 등급 포인트가 올라가요 (최대 {MAX_PHOTOS}장)
          </Text>

          {isUploadDone ? (
            /* 업로드 완료 상태 */
            <View style={styles.uploadDoneContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailRow}
              >
                {uploadResult.photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: toAbsoluteImageUrl(photo.photoUrl) ?? '' }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.uploadedBadge}>
                <Text style={styles.uploadedText}>✅ 업로드 완료</Text>
              </View>
              <Text style={styles.pointText}>등급 포인트 +1! 🎉</Text>
            </View>
          ) : (
            /* 사진 선택/업로드 전 상태 */
            <View style={styles.photoSelectContainer}>
              {/* 썸네일 목록 + 추가 버튼 */}
              {(photoUris.length > 0 || !isUploading) && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailRow}
                >
                  {photoUris.map((uri, index) => (
                    <View key={uri + index} style={styles.thumbnailWrapper}>
                      <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
                      {!isUploading && (
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemovePhoto(index)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {photoUris.length < MAX_PHOTOS && !isUploading && (
                    <TouchableOpacity
                      style={styles.addPhotoBtn}
                      onPress={handlePickPhotos}
                      disabled={!isCompleted}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addPhotoBtnPlus}>+</Text>
                      <Text style={styles.addPhotoBtnLabel}>추가</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}

              {/* 선택 개수 */}
              {photoUris.length > 0 && !isUploading && (
                <Text style={styles.countText}>{photoUris.length}장 선택됨</Text>
              )}

              {/* 업로드 진행 중 */}
              {isUploading && uploadProgress && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.uploadingText}>
                    사진 업로드 중... ({uploadProgress.current}/{uploadProgress.total})
                  </Text>
                </View>
              )}

              {/* 사진 없을 때 선택 버튼 */}
              {photoUris.length === 0 && !isUploading && (
                <Button
                  title="사진 선택하기"
                  onPress={handlePickPhotos}
                  disabled={!isCompleted}
                  variant="outline"
                  size="medium"
                  style={styles.photoBtn}
                />
              )}
            </View>
          )}
        </View>

        {/* ─── 응원 메시지 ─── */}
        <Text style={styles.encouragement}>
          {newCount <= 2
            ? '첫 걸음을 뗐어요! 다음 요리도 도전해보세요 💪'
            : newCount <= 10
            ? '꾸준히 하고 있어요! 이 조자면 금방 마스터! 🔥'
            : '대단해요! 이미 베테랑 요리사시네요 ⭐'}
        </Text>
      </ScrollView>

      {/* ─── 하단 버튼 ─── */}
      <View style={styles.footer}>
        {isUploadDone ? (
          /* 업로드 완료 → 홈으로 */
          <Button
            title="홈으로 돌아가기"
            onPress={handleDone}
            size="large"
            style={styles.doneBtn}
          />
        ) : uploadFailed ? (
          /* 업로드 실패 → 다시 시도 + 건너뛰기 */
          <View style={styles.footerButtons}>
            <Button
              title="다시 시도"
              onPress={handleRetryUpload}
              size="large"
              style={styles.footerBtnFull}
            />
            <Button
              title="사진 없이 완료"
              onPress={handleSkipPhoto}
              variant="ghost"
              size="medium"
              style={styles.skipBtn}
            />
          </View>
        ) : photoUris.length > 0 && !isUploading ? (
          /* 사진 선택됨 → 업로드 + 건너뛰기 */
          <View style={styles.footerButtons}>
            <Button
              title="사진 올리고 완료하기"
              onPress={handleUploadAndComplete}
              size="large"
              style={styles.footerBtnFull}
            />
            <Button
              title="사진 없이 완료"
              onPress={handleSkipPhoto}
              variant="ghost"
              size="medium"
              style={styles.skipBtn}
            />
          </View>
        ) : isUploading ? (
          /* 업로드 중 → 비활성 버튼 */
          <Button
            title="업로드 중..."
            onPress={() => {}}
            disabled
            size="large"
            style={styles.doneBtn}
            loading
          />
        ) : (
          /* 사진 미선택 → 건너뛰기만 */
          <Button
            title="사진 없이 완료"
            onPress={handleSkipPhoto}
            variant="outline"
            size="large"
            style={styles.doneBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 20,
  },

  // 헤더
  emoji: { fontSize: 56 },
  heading: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  recipeName: { fontSize: 17, color: '#6B7280', fontWeight: '500' },

  // 요약 카드
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: { fontSize: 13, color: '#9CA3AF' },
  summaryValue: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
  },

  // 레벨업
  levelUpCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  levelUpBadge: { fontSize: 15, fontWeight: '700', color: '#EA580C' },
  levelUpEmoji: { fontSize: 48 },
  levelUpTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  levelUpDesc: { fontSize: 14, color: '#9CA3AF' },

  // 등급 진행
  rankCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankEmoji: { fontSize: 36 },
  rankTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  rankNext: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  progressBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },

  // 사진 카드
  photoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  photoDesc: { fontSize: 13, color: '#9CA3AF' },
  photoBtn: { marginTop: 8 },

  // 사진 선택 영역
  photoSelectContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  // 썸네일 행
  thumbnailRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  // 삭제 버튼
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },

  // 추가 버튼
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoBtnPlus: {
    fontSize: 22,
    color: '#9CA3AF',
    fontWeight: '600',
    lineHeight: 24,
  },
  addPhotoBtnLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // 선택 카운트
  countText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 업로드 중
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  uploadingText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // 업로드 완료
  uploadDoneContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  uploadedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  uploadedText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  pointText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EA580C',
  },

  // 응원
  encouragement: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // 하단
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  footerButtons: {
    gap: 8,
  },
  footerBtnFull: {
    width: '100%',
  },
  skipBtn: {
    alignSelf: 'center',
  },
  doneBtn: { width: '100%' },
});
